import { Schema } from "@powersync/web";
import { TODO_TABLE_DEFINITION } from "./todo";
export * from "./todo";

export const APP_SCHEMA = new Schema({
  todo: TODO_TABLE_DEFINITION,
});
