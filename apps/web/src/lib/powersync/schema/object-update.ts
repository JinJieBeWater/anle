import { column } from "@powersync/web";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { objectUpdate } from "@anle/db/schema/object-update";
import type { TableDefinition } from "../types";
import { stringToDate } from "../zod-helpers";

export const OBJECT_UPDATE_TABLE_DEF: TableDefinition = {
  name: "object_update",
  columns: {
    owner_id: column.text,
    object_id: column.text,
    created_at: column.text,
    update_data: column.text,
  },
  options: {
    indexes: {
      by_object: ["object_id"],
    },
  },
};

export const objectUpdateSchema = createSelectSchema(objectUpdate);

export const objectUpdateDeserializationSchema = z.object({
  ...objectUpdateSchema.shape,
  created_at: stringToDate,
});

export type ObjectUpdate = z.output<typeof objectUpdateSchema>;
