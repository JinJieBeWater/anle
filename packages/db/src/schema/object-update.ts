import { relations, sql } from "drizzle-orm";
import { index, pgPolicy, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { bytea } from "./custom-types";
import { object } from "./object";

export const objectUpdate = pgTable(
  "object_update",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    object_id: uuid("object_id")
      .notNull()
      .references(() => object.id, { onDelete: "cascade" }),
    field_key: text("field_key").notNull(),
    update_data: bytea("update_data").notNull(),
  },
  (table) => [
    index("object_update_object_field_idx").on(table.object_id, table.field_key),
    pgPolicy("object_update_owner", {
      for: "all",
      to: "public",
      using: sql`EXISTS (
        SELECT 1
        FROM "object"
        WHERE "object".id = object_id
          AND "object".owner_id = current_setting('app.user_id', true)
      )`,
      withCheck: sql`EXISTS (
        SELECT 1
        FROM "object"
        WHERE "object".id = object_id
          AND "object".owner_id = current_setting('app.user_id', true)
      )`,
    }),
  ],
).enableRLS();

export const objectUpdateRelations = relations(objectUpdate, ({ one }) => ({
  object: one(object, {
    fields: [objectUpdate.object_id],
    references: [object.id],
  }),
}));
