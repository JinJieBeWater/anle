import { column } from "@powersync/web";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { objectTemplate, objectTemplateConfigSchema } from "@anle/db/schema/object-template";
import type { TableDefinition } from "../types";
import { nullableStringToJson, stringToDate } from "../zod-helpers";

export const OBJECT_TEMPLATE_TABLE_DEF: TableDefinition = {
  name: "object_template",
  columns: {
    owner_id: column.text,
    name: column.text,
    config: column.text,
    updated_at: column.text,
    created_at: column.text,
  },
  options: {
    indexes: {
      by_owner: ["owner_id"],
    },
  },
};

export const objectTemplateSchema = createSelectSchema(objectTemplate, {
  config: objectTemplateConfigSchema.nullish(),
});

export const objectTemplateDeserializationSchema = z.object({
  ...objectTemplateSchema.shape,
  updated_at: stringToDate,
  created_at: stringToDate,
  config: nullableStringToJson.pipe(objectTemplateConfigSchema.nullish()),
});

export type ObjectTemplate = z.output<typeof objectTemplateSchema>;
