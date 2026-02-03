import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { bytea } from "./custom-types";
import { object } from "./object";
import { user } from "./auth";

export const objectUpdate = pgTable(
  "object_update",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    owner_id: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    object_id: uuid("object_id")
      .notNull()
      .references(() => object.id, { onDelete: "cascade" }),
    update_data: bytea("update_data").notNull(),
  },
  (table) => [
    index("object_update_owner_idx").on(table.owner_id),
    index("object_update_object_idx").on(table.object_id),
  ],
);

export const objectUpdateRelations = relations(objectUpdate, ({ one }) => ({
  owner: one(user, {
    fields: [objectUpdate.owner_id],
    references: [user.id],
  }),
  object: one(object, {
    fields: [objectUpdate.object_id],
    references: [object.id],
  }),
}));
