import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { bytea } from "./custom-types";

export const yjsUpdate = pgTable(
  "yjs_update",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    entity_type: varchar("entity_type", { length: 64 }).notNull(),
    entity_id: uuid("entity_id").notNull(),
    update_data: bytea("update_data").notNull(),
  },
  (table) => [index("yjs_update_entity_idx").on(table.entity_type, table.entity_id)],
);
