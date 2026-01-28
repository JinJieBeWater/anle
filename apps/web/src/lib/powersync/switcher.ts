import type { AbstractPowerSyncDatabase } from "@powersync/web";
import { todoCollection } from "../collections";
import { SYNCED_SCHEMA, LOCAL_SCHEMA } from "./schema";
import { setSyncEnabled } from "./sync-mode";

export const switchToSyncedSchema = async (db: AbstractPowerSyncDatabase, userId: string) => {
  console.log("Switching to synced schema");
  await todoCollection.cleanup();
  await db.updateSchema(SYNCED_SCHEMA);
  setSyncEnabled(db.database.name, true);

  await db.writeTransaction(async (tx) => {
    await tx.execute(
      "INSERT INTO todo(id, text, completed, owner_id) SELECT id, text, completed, ? FROM inactive_local_todo",
      [userId],
    );
    await tx.execute("DELETE FROM inactive_local_todo");
  });

  todoCollection.startSyncImmediate();
};

export const switchToLocalSchema = async (db: AbstractPowerSyncDatabase) => {
  console.log("Switching to local schema");
  await todoCollection.cleanup();
  await db.updateSchema(LOCAL_SCHEMA);
  setSyncEnabled(db.database.name, false);
  todoCollection.startSyncImmediate();
};
