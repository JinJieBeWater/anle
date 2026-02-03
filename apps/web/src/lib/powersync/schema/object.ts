import { column } from "@powersync/web";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { object } from "@anle/db/schema/object";
import type { TableDefinition } from "../types";
import { stringToDate } from "../zod-helpers";

export const OBJECT_TABLE_DEF: TableDefinition = {
  name: "object",
  columns: {
    owner_id: column.text,
    domain: column.text,
    type: column.text,
    name: column.text,
    metadata: column.text,
    updated_at: column.text,
    created_at: column.text,
  },
  options: {
    indexes: {
      by_owner: ["owner_id"],
      by_owner_domain_type: ["owner_id", "domain", "type"],
    },
  },
};

export const ObjectSchema = createSelectSchema(object);

export const ObjectDeserializationSchema = z.object({
  ...ObjectSchema.shape,
  updated_at: stringToDate,
  created_at: stringToDate,
});

export type Object = z.output<typeof ObjectSchema>;
