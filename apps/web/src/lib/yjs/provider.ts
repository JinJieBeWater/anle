import * as Y from "yjs";

import { b64ToUint8Array, Uint8ArrayTob64 } from "./binary";
import { AbstractPowerSyncDatabase } from "@powersync/web";
import { ObservableV2 } from "lib0/observable";
import { isComposing } from "@/components/editor/extensions/ime-update-optimizer";
import type { ObjectUpdate } from "@/lib/powersync/schema";

export interface PowerSyncYjsEvents {
  /**
   * Triggered when document contents have been loaded from the database the first time.
   *
   * The document data may not have been synced from the PowerSync service at this point.
   */
  synced: () => void;
}

export type YjsProviderOptions = {
  objectId: string;
  ownerId: string;
  onLoaded?: () => void;
  /**
   * Throttle window in milliseconds for persisting updates.
   * Defaults to 200ms.
   */
  throttleMs?: number;
};

/**
 * Configure bidirectional sync for a Yjs document with a PowerSync database.
 *
 * Updates are stored in the `object_update` table in the database.
 *
 * @param ydoc
 * @param db
 * @param options
 */
export class YjsProvider extends ObservableV2<PowerSyncYjsEvents> {
  private abortController = new AbortController();
  private pendingUpdates: Uint8Array[] = [];
  private throttleTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly throttleMs: number;
  private readonly documentId: string;

  constructor(
    public readonly doc: Y.Doc,
    public readonly db: AbstractPowerSyncDatabase,
    public readonly options: YjsProviderOptions,
  ) {
    super();
    this._storeUpdate = this._storeUpdate.bind(this);
    this.destroy = this.destroy.bind(this);
    this.flushPendingUpdates = this.flushPendingUpdates.bind(this);
    this.throttleMs = this.options.throttleMs ?? 300;
    this.documentId = this.options.objectId;

    let synced = false;
    // oxlint-disable-next-line typescript/no-this-alias
    const origin = this;

    /**
     * Watch for changes to the `object_update` table for this object.
     * This will be used to apply updates from other editors.
     * When we received an added item we apply the update to the Yjs document.
     */
    const updateQuery = db
      .query<
        Omit<ObjectUpdate, "update_data"> & {
          update_data: string;
        }
      >({
        sql: /* sql */ `
          SELECT
            *
          FROM
            object_update
          WHERE
            object_id = ?
        `,
        parameters: [this.options.objectId],
      })
      .differentialWatch();

    updateQuery.registerListener({
      onStateChange: (state) => {
        if (state.isLoading === false) {
          this.options.onLoaded?.();
        }
      },
      onDiff: async (diff) => {
        for (const added of diff.added) {
          /**
           * Local object updates get stored to the database and synced.
           *
           * These updates here originate from syncing remote updates.
           * Applying these updates to YJS should not result in the `_storeUpdate`
           * handler creating a new `object_update` record since we mark the `origin`
           * here and check the `origin` in `_storeUpdate`.
           */
          Y.applyUpdateV2(doc, b64ToUint8Array(added.update_data), origin);
        }
        if (!synced) {
          synced = true;
          this.emit("synced", []);
        }
      },
      onError: (error) => {
        console.error("Error in YjsProvider update query:", error);
      },
    });

    this.abortController.signal.addEventListener(
      "abort",
      () => {
        // Stop the watch query when the abort signal is triggered
        updateQuery.close();
      },
      { once: true },
    );

    doc.on("updateV2", this._storeUpdate);
    doc.on("destroy", this.destroy);
  }

  private async _storeUpdate(update: Uint8Array, origin: any) {
    if (origin === this) {
      // update originated from the database / PowerSync - ignore
      return;
    }
    if (isComposing(this.documentId)) {
      return;
    }
    this.queueUpdate(update);
  }

  async storeSnapshot(stateVector?: Uint8Array) {
    await this.persistUpdate(Y.encodeStateAsUpdateV2(this.doc, stateVector));
  }

  private async persistUpdate(update: Uint8Array) {
    await this.db.execute(
      /* sql */ `
        INSERT INTO
          object_update (id, owner_id, object_id, created_at, update_data)
        VALUES
          (?, ?, ?, ?, ?)
      `,
      [
        crypto.randomUUID(),
        this.options.ownerId,
        this.options.objectId,
        new Date().toISOString(),
        Uint8ArrayTob64(update),
      ],
    );
  }

  private queueUpdate(update: Uint8Array) {
    this.pendingUpdates.push(update);
    if (this.throttleTimer) {
      return;
    }
    this.throttleTimer = setTimeout(this.flushPendingUpdates, this.throttleMs);
  }

  private async flushPendingUpdates() {
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
    if (this.pendingUpdates.length === 0) return;
    const updates = this.pendingUpdates;
    this.pendingUpdates = [];

    const merged = updates.length === 1 ? updates[0] : Y.mergeUpdatesV2(updates);
    await this.persistUpdate(merged);
  }

  /**
   * Destroy this persistence provider, removing any attached event listeners.
   */
  destroy() {
    this.abortController.abort();
    void this.flushPendingUpdates();
    this.doc.off("updateV2", this._storeUpdate);
    this.doc.off("destroy", this.destroy);
  }

  /**
   * Delete data associated with this object from the database.
   *
   * Also call `destroy()` to remove any event listeners and prevent future updates to the database.
   */
  async deleteData() {
    await this.db.execute(
      /* sql */ `
        DELETE FROM object_update
        WHERE
          object_id = ?
      `,
      [this.options.objectId],
    );
  }

  async gcLocalUpdates() {
    await this.flushPendingUpdates();

    return this.db.writeTransaction(async (tx) => {
      const updates = await tx.getAll<{ id: string; update_data: string; created_at: string }>(
        /* sql */ `
          SELECT
            id,
            update_data,
            created_at
          FROM
            object_update
          WHERE
            object_id = ?
          ORDER BY
            created_at ASC
        `,
        [this.options.objectId],
      );

      if (updates.length <= 1) {
        return {
          success: `0 object_update rows compacted for ${this.options.objectId}`,
        };
      }

      const ydoc = new Y.Doc({ gc: true });
      for (const update of updates) {
        Y.applyUpdateV2(ydoc, b64ToUint8Array(update.update_data));
      }
      const compactUpdate = Uint8ArrayTob64(Y.encodeStateAsUpdateV2(ydoc));
      ydoc.destroy();

      const updateIds = updates.map((update) => update.id);
      const latestCreatedAt = updates[updates.length - 1]?.created_at ?? new Date().toISOString();

      const chunkSize = 200;
      for (let i = 0; i < updateIds.length; i += chunkSize) {
        const chunk = updateIds.slice(i, i + chunkSize);
        const placeholders = chunk.map(() => "?").join(", ");
        await tx.execute(`DELETE FROM object_update WHERE id IN (${placeholders})`, chunk);
      }

      await tx.execute(
        /* sql */ `
          INSERT INTO
            object_update (id, owner_id, object_id, created_at, update_data)
          VALUES
            (?, ?, ?, ?, ?)
        `,
        [
          crypto.randomUUID(),
          this.options.ownerId,
          this.options.objectId,
          latestCreatedAt,
          compactUpdate,
        ],
      );

      return {
        success: `${updates.length} object_update rows compacted for ${this.options.objectId}`,
      };
    });
  }
}
