import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { objectTemplate } from "./object-template";
import { user } from "./auth";

export const object = pgTable(
  "object",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    owner_id: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    template_id: uuid("template_id")
      .notNull()
      .references(() => objectTemplate.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    name: varchar("name", { length: 255 }),
    metadata: jsonb("metadata"),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("object_owner_type_idx").on(table.owner_id, table.type),
    index("object_template_idx").on(table.template_id),
  ],
);

export const objectRelations = relations(object, ({ one }) => ({
  owner: one(user, {
    fields: [object.owner_id],
    references: [user.id],
  }),
  template: one(objectTemplate, {
    fields: [object.template_id],
    references: [objectTemplate.id],
  }),
}));

// export const objectRelationType = pgEnum("object_relation_type", [
//   "member",
//   "parent",
//   "next",
//   "prev",
//   "reference",
// ]);

// export const objectRelation = pgTable(
//   "object_relation",
//   {
//     owner_id: text("owner_id")
//       .notNull()
//       .references(() => user.id, { onDelete: "cascade" }),
//     from_object_id: uuid("from_object_id")
//       .notNull()
//       .references(() => object.id, { onDelete: "cascade" }),
//     to_object_id: uuid("to_object_id")
//       .notNull()
//       .references(() => object.id, { onDelete: "cascade" }),
//     type: objectRelationType("type").notNull(),
//     position: text("position"),
//     created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
//   },
//   (table) => [
//     primaryKey({ columns: [table.from_object_id, table.to_object_id, table.type] }),
//     index("object_relation_owner_idx").on(table.owner_id),
//     index("object_relation_from_idx").on(table.from_object_id, table.type),
//     index("object_relation_to_idx").on(table.to_object_id, table.type),
//   ],
// );
