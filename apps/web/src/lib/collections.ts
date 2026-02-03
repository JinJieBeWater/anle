import { db } from "./powersync/db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
import { createCollection } from "@tanstack/react-db";
import {
  SYNCED_SCHEMA,
  todoSchema,
  todoDeserializationSchema,
  objectSchema,
  objectDeserializationSchema,
} from "./powersync/schema";

export const todoCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: SYNCED_SCHEMA.props.todo,
    schema: todoSchema,
    deserializationSchema: todoDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(
        `Could not deserialize todo collection: ${error.issues.map((issue) => issue.message).join(", ")}`,
      );
    },
  }),
);

export const objectCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: SYNCED_SCHEMA.props.object,
    schema: objectSchema,
    deserializationSchema: objectDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(
        `Could not deserialize object collection: ${error.issues.map((issue) => issue.message).join(", ")}`,
      );
    },
  }),
);
