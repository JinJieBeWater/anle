import { column } from "@powersync/web";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { objectRelation } from "@anle/db/schema/object";
import type { TableDefinition } from "../types";
import { stringToDate } from "../zod-helpers";

export const OBJECT_RELATION_TABLE_DEF: TableDefinition = {
  name: "object_relation",
  columns: {
    from_object_id: column.text,
    to_object_id: column.text,
    type: column.text,
    position: column.text,
    created_at: column.text,
  },
  options: {
    indexes: {
      by_from_type: ["from_object_id", "type"],
      by_to_type: ["to_object_id", "type"],
    },
  },
};

export const objectRelationSchema = createSelectSchema(objectRelation).extend({
  id: z.string(),
});

export const objectRelationDeserializationSchema = z.object({
  ...objectRelationSchema.shape,
  created_at: stringToDate,
});

export type ObjectRelation = z.output<typeof objectRelationSchema>;
