import { column } from "@powersync/web";
import type { TableDefinition } from "../types";
import { document, documentUpdate } from "@anle/db/schema/document";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { stringToDate } from "../zod-helpers";

export const DOCUMENT_TABLE_DEF: TableDefinition = {
  name: "document",
  columns: {
    title: column.text,
    created_at: column.text,
  },
};

export const DOCUMENT_UPDATE_TABLE_DEF: TableDefinition = {
  name: "document_update",
  columns: {
    document_id: column.text,
    created_at: column.text,
    update_data: column.text,
  },
  options: {
    indexes: {
      by_document: ["document_id"],
    },
  },
};

export const DocumentSchema = createSelectSchema(document);

export const DocumentDeserializationSchema = z.object({
  ...DocumentSchema.shape,
  created_at: stringToDate,
});

export type Document = z.output<typeof DocumentSchema>;

export const DocumentUpdateSchema = createSelectSchema(documentUpdate);

export const DocumentUpdateDeserializationSchema = z.object({
  ...DocumentUpdateSchema.shape,
  created_at: stringToDate,
});

export type DocumentUpdate = z.output<typeof DocumentUpdateSchema>;
