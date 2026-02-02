import { column } from "@powersync/web";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { yjsUpdate } from "@anle/db/schema/yjs-update";
import type { TableDefinition } from "../types";
import { stringToDate } from "../zod-helpers";

export const YJS_UPDATE_TABLE_DEF: TableDefinition = {
  name: "yjs_update",
  columns: {
    entity_type: column.text,
    entity_id: column.text,
    created_at: column.text,
    update_data: column.text,
  },
  options: {
    indexes: {
      by_entity: ["entity_type", "entity_id"],
    },
  },
};

export const YjsUpdateSchema = createSelectSchema(yjsUpdate);

export const YjsUpdateDeserializationSchema = z.object({
  ...YjsUpdateSchema.shape,
  created_at: stringToDate,
});

export type YjsUpdate = z.output<typeof YjsUpdateSchema>;
