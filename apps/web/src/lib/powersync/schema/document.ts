import { column } from "@powersync/web";
import type { TableDefinition } from "../types";
import { document } from "@anle/db/schema/document";
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

export const DocumentSchema = createSelectSchema(document);

export const DocumentDeserializationSchema = z.object({
  ...DocumentSchema.shape,
  created_at: stringToDate,
});

export type Document = z.output<typeof DocumentSchema>;
