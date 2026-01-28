import { Schema, Table } from "@powersync/web";
import { TODO_TABLE_DEF } from "./todo";
export * from "./todo";

const syncedViewName = (tableName: string, synced: boolean) =>
  synced ? tableName : `inactive_synced_${tableName}`;

const localViewName = (tableName: string, synced: boolean) =>
  synced ? `inactive_local_${tableName}` : tableName;

export const makeSchema = (synced: boolean) =>
  new Schema({
    todo: new Table(TODO_TABLE_DEF.columns, {
      ...TODO_TABLE_DEF.options,
      viewName: syncedViewName(TODO_TABLE_DEF.name, synced),
    }),
    local_todo: new Table(TODO_TABLE_DEF.columns, {
      ...TODO_TABLE_DEF.options,
      localOnly: true,
      viewName: localViewName(TODO_TABLE_DEF.name, synced),
    }),
  });

export const LOCAL_SCHEMA = makeSchema(false);
export const SYNCED_SCHEMA = makeSchema(true);

// This is only used for typing purposes
export const AppSchema = LOCAL_SCHEMA;

export type Database = (typeof AppSchema)["types"];
