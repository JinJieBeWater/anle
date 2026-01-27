import { env } from "@anle/env/web";
import {
  AbstractPowerSyncDatabase,
  BaseObserver,
  CrudEntry,
  type PowerSyncBackendConnector,
  type PowerSyncCredentials,
} from "@powersync/web";
import { authClient } from "../auth-client";
import type { Session, User } from "better-auth";
import { queryClient } from "@/utils/orpc";
import { handleCrudOp } from "./handler";

const GetSessionQueryOptions = {
  queryKey: ["auth", "session"],
  queryFn: () => authClient.getSession(),
};

type AnleSession = {
  user: User;
  session: Session;
};

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

    const sessionResponse = await queryClient.fetchQuery(GetSessionQueryOptions);

    this.updateSession(sessionResponse.data);

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
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    let lastOp: CrudEntry | null = null;
    try {
      // Note: If transactional consistency is important, use database functions
      // or edge functions to process the entire transaction in a single call.
      for (const op of transaction.crud) {
        lastOp = op;
        await handleCrudOp(op);
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
    this.currentSession = session;
    if (!session) {
      return;
    }
    this.iterateListeners((cb) => cb.sessionStarted?.(session));
  }
}
