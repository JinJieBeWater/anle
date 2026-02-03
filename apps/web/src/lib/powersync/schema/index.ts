import { Schema, Table } from "@powersync/web";
import { TODO_TABLE_DEF } from "./todo";
import { OBJECT_TABLE_DEF } from "./object";
import { OBJECT_UPDATE_TABLE_DEF } from "./object-update";
export * from "./todo";
export * from "./object";
export * from "./object-update";

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
    object: new Table(OBJECT_TABLE_DEF.columns, {
      ...OBJECT_TABLE_DEF.options,
      viewName: syncedViewName(OBJECT_TABLE_DEF.name, synced),
    }),
    local_object: new Table(OBJECT_TABLE_DEF.columns, {
      ...OBJECT_TABLE_DEF.options,
      localOnly: true,
      viewName: localViewName(OBJECT_TABLE_DEF.name, synced),
    }),
    object_update: new Table(OBJECT_UPDATE_TABLE_DEF.columns, {
      ...OBJECT_UPDATE_TABLE_DEF.options,
      viewName: syncedViewName(OBJECT_UPDATE_TABLE_DEF.name, synced),
    }),
    local_object_update: new Table(OBJECT_UPDATE_TABLE_DEF.columns, {
      ...OBJECT_UPDATE_TABLE_DEF.options,
      localOnly: true,
      viewName: localViewName(OBJECT_UPDATE_TABLE_DEF.name, synced),
    }),
  });

export const LOCAL_SCHEMA = makeSchema(false);
export const SYNCED_SCHEMA = makeSchema(true);

// This is only used for typing purposes
export const AppSchema = LOCAL_SCHEMA;

export type Database = (typeof AppSchema)["types"];
