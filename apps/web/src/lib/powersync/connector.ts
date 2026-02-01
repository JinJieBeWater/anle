import { env } from "@anle/env/web";
import {
  AbstractPowerSyncDatabase,
  BaseObserver,
  CrudEntry,
  type PowerSyncBackendConnector,
  type PowerSyncCredentials,
} from "@powersync/web";
import { authClient } from "../auth-client";
import { GetSessionQueryOptions, queryClient } from "@/utils/orpc";
import { buildUploadBatchers, handleCrudOp } from "./handler";
import type { AnleSession } from "./types";
import { shouldNeverHappen } from "@/utils/should-never-happen";

export type AnleConfig = {
  powersyncUrl: string;
};

/// Postgres Response codes that we cannot recover from by retrying.
const FATAL_RESPONSE_CODES = [
  // Class 22 — Data Exception
  // Examples include data type mismatch.
  new RegExp("^22...$"),
  // Class 23 — Integrity Constraint Violation.
  // Examples include NOT NULL, FOREIGN KEY and UNIQUE violations.
  new RegExp("^23...$"),
  // INSUFFICIENT PRIVILEGE - typically a row-level security violation
  new RegExp("^42501$"),
];

export type ConnectorListener = {
  initialized: () => void;
  sessionStarted: (session: AnleSession) => void;
};

export class Connector
  extends BaseObserver<ConnectorListener>
  implements PowerSyncBackendConnector
{
  readonly config: AnleConfig;

  ready: boolean;

  currentSession: AnleSession | null;

  constructor() {
    super();
    this.config = {
      powersyncUrl: env.VITE_POWERSYNC_URL,
    };

    this.currentSession = null;
    this.ready = false;
  }

  async init() {
    if (this.ready) {
      return;
    }

    const session = await queryClient.fetchQuery(GetSessionQueryOptions);

    this.updateSession(session.data);

    this.ready = true;
    this.iterateListeners((cb) => cb.initialized?.());
  }

  async fetchCredentials() {
    const { data, error } = await authClient.token();

    if (error) {
      throw new Error(`Could not fetch Supabase credentials: ${error}`);
    }

    if (!data?.token) {
      return null;
    }

    return {
      endpoint: this.config.powersyncUrl,
      token: data.token ?? "",
    } satisfies PowerSyncCredentials;
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const session = this.currentSession;
    if (!session) {
      throw shouldNeverHappen("Cannot upload data without an active session");
    }

    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    let lastOp: CrudEntry | null = null;
    const batchers = buildUploadBatchers();
    try {
      for (const op of transaction.crud) {
        lastOp = op;
        const batcher = batchers.find((candidate) => candidate.match(op));
        if (batcher) {
          batcher.add(op);
          continue;
        }

        await handleCrudOp(op, { session });
      }

      for (const batcher of batchers) {
        await batcher.flush({ session });
      }

      await transaction.complete();
    } catch (ex: any) {
      console.debug(ex);
      if (typeof ex.code == "string" && FATAL_RESPONSE_CODES.some((regex) => regex.test(ex.code))) {
        /**
         * Instead of blocking the queue with these errors,
         * discard the (rest of the) transaction.
         *
         * Note that these errors typically indicate a bug in the application.
         * If protecting against data loss is important, save the failing records
         * elsewhere instead of discarding, and/or notify the user.
         */
        console.error("Data upload error - discarding:", lastOp, ex);
        await transaction.complete();
      } else {
        // Error may be retryable - e.g. network error or temporary server error.
        // Throwing an error here causes this call to be retried after a delay.
        throw ex;
      }
    }
  }

  updateSession(session: AnleSession | null) {
    const isFirstLogin = this.currentSession === null && session !== null;
    this.currentSession = session;
    if (!session) {
      return;
    }
    if (isFirstLogin) {
      this.iterateListeners((cb) => cb.sessionStarted?.(session));
    }
  }

  removeSession() {
    this.updateSession(null);
  }

  get canConnect(): boolean {
    return this.ready && this.currentSession !== null;
  }
}

export const connector = new Connector();
