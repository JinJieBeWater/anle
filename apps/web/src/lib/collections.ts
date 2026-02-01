import { db } from "./powersync/db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
import { createCollection } from "@tanstack/react-db";
import {
  SYNCED_SCHEMA,
  TodoSchema,
  TodoDeserializationSchema,
  DocumentSchema,
  DocumentDeserializationSchema,
} from "./powersync/schema";

export const todoCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: SYNCED_SCHEMA.props.todo,
    schema: TodoSchema,
    deserializationSchema: TodoDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(
        `Could not deserialize todo collection: ${error.issues.map((issue) => issue.message).join(", ")}`,
      );
    },
  }),
);

export const documentCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: SYNCED_SCHEMA.props.document,
    schema: DocumentSchema,
    deserializationSchema: DocumentDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(
        `Could not deserialize document collection: ${error.issues.map((issue) => issue.message).join(", ")}`,
      );
    },
  }),
);
