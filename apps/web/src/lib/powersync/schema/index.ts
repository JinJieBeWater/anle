import { Schema, Table } from "@powersync/web";
import { TODO_TABLE_DEF } from "./todo";
import { DOCUMENT_TABLE_DEF } from "./document";
import { YJS_UPDATE_TABLE_DEF } from "./yjs-update";
export * from "./todo";
export * from "./document";
export * from "./yjs-update";

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
    document: new Table(DOCUMENT_TABLE_DEF.columns, {
      ...DOCUMENT_TABLE_DEF.options,
      viewName: syncedViewName(DOCUMENT_TABLE_DEF.name, synced),
    }),
    local_document: new Table(DOCUMENT_TABLE_DEF.columns, {
      ...DOCUMENT_TABLE_DEF.options,
      localOnly: true,
      viewName: localViewName(DOCUMENT_TABLE_DEF.name, synced),
    }),
    yjs_update: new Table(YJS_UPDATE_TABLE_DEF.columns, {
      ...YJS_UPDATE_TABLE_DEF.options,
      viewName: syncedViewName(YJS_UPDATE_TABLE_DEF.name, synced),
    }),
    local_yjs_update: new Table(YJS_UPDATE_TABLE_DEF.columns, {
      ...YJS_UPDATE_TABLE_DEF.options,
      localOnly: true,
      viewName: localViewName(YJS_UPDATE_TABLE_DEF.name, synced),
    }),
  });

export const LOCAL_SCHEMA = makeSchema(false);
export const SYNCED_SCHEMA = makeSchema(true);

// This is only used for typing purposes
export const AppSchema = LOCAL_SCHEMA;

export type Database = (typeof AppSchema)["types"];
