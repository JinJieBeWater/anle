import type { AbstractPowerSyncDatabase } from "@powersync/web";
import { objectCollection, todoCollection } from "../collections";
import { SYNCED_SCHEMA, LOCAL_SCHEMA } from "./schema";
import { setSyncEnabled } from "./sync-mode";

export const switchToSyncedSchema = async (db: AbstractPowerSyncDatabase, userId: string) => {
  console.log("Switching to synced schema");
  await todoCollection.cleanup();
  await objectCollection.cleanup();
  await db.updateSchema(SYNCED_SCHEMA);
  setSyncEnabled(db.database.name, true);

  await db.writeTransaction(async (tx) => {
    await tx.execute(
      "INSERT INTO todo(id, text, completed, owner_id) SELECT id, text, completed, ? FROM inactive_local_todo",
      [userId],
    );
    await tx.execute("DELETE FROM inactive_local_todo");

    await tx.execute(
      "INSERT INTO object(id, owner_id, domain, type, name, metadata, updated_at, created_at) SELECT id, ?, domain, type, name, metadata, updated_at, created_at FROM inactive_local_object",
      [userId],
    );
    await tx.execute("DELETE FROM inactive_local_object");

    await tx.execute(
      "INSERT INTO object_update(id, owner_id, object_id, created_at, update_data) SELECT id, ?, object_id, created_at, update_data FROM inactive_local_object_update",
      [userId],
    );
    await tx.execute("DELETE FROM inactive_local_object_update");
  });

  todoCollection.startSyncImmediate();
  objectCollection.startSyncImmediate();
};

export const switchToLocalSchema = async (db: AbstractPowerSyncDatabase) => {
  console.log("Switching to local schema");
  await todoCollection.cleanup();
  await objectCollection.cleanup();
  await db.updateSchema(LOCAL_SCHEMA);
  setSyncEnabled(db.database.name, false);
  todoCollection.startSyncImmediate();
  objectCollection.startSyncImmediate();
};
