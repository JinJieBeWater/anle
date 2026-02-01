import type { AbstractPowerSyncDatabase } from "@powersync/web";
import { documentCollection, todoCollection } from "../collections";
import { SYNCED_SCHEMA, LOCAL_SCHEMA } from "./schema";
import { setSyncEnabled } from "./sync-mode";

export const switchToSyncedSchema = async (db: AbstractPowerSyncDatabase, userId: string) => {
  console.log("Switching to synced schema");
  await todoCollection.cleanup();
  await documentCollection.cleanup();
  await db.updateSchema(SYNCED_SCHEMA);
  setSyncEnabled(db.database.name, true);

  await db.writeTransaction(async (tx) => {
    await tx.execute(
      "INSERT INTO todo(id, text, completed, owner_id) SELECT id, text, completed, ? FROM inactive_local_todo",
      [userId],
    );
    await tx.execute("DELETE FROM inactive_local_todo");

    await tx.execute(
      "INSERT INTO document(id, title, created_at) SELECT id, title, created_at FROM inactive_local_document",
    );
    await tx.execute("DELETE FROM inactive_local_document");

    await tx.execute(
      "INSERT INTO document_update(id, document_id, created_at, update_data) SELECT id, document_id, created_at, update_data FROM inactive_local_document_update",
    );
    await tx.execute("DELETE FROM inactive_local_document_update");
  });

  todoCollection.startSyncImmediate();
  documentCollection.startSyncImmediate();
};

export const switchToLocalSchema = async (db: AbstractPowerSyncDatabase) => {
  console.log("Switching to local schema");
  await todoCollection.cleanup();
  await documentCollection.cleanup();
  await db.updateSchema(LOCAL_SCHEMA);
  setSyncEnabled(db.database.name, false);
  todoCollection.startSyncImmediate();
  documentCollection.startSyncImmediate();
};
