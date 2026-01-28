import { PowerSyncDatabase, WASQLiteOpenFactory, WASQLiteVFS } from "@powersync/web";
import { SYNCED_SCHEMA, LOCAL_SCHEMA } from "./schema";
import { getSyncEnabled } from "./sync-mode";

export const DB_FILENAME = "anle.db";
export const initialSyncEnabled = getSyncEnabled(DB_FILENAME);
const initialSchema = initialSyncEnabled ? SYNCED_SCHEMA : LOCAL_SCHEMA;

export const db = new PowerSyncDatabase({
  schema: initialSchema,
  database: new WASQLiteOpenFactory({
    dbFilename: DB_FILENAME,
    vfs: WASQLiteVFS.OPFSCoopSyncVFS,
  }),
});
