import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const KNOWN_OBJECT_DOMAINS = ["template", "journal", "note", "blog", "novel"] as const;
export type KnownObjectDomain = (typeof KNOWN_OBJECT_DOMAINS)[number];
export type ObjectDomain = KnownObjectDomain | (string & {});

export const KNOWN_OBJECT_TYPES = [
  "template_template",
  "template_field",
  "template_section",
  "template_option",
  "journal_entry",
  "note_folder",
  "note_entry",
  "blog_folder",
  "blog_post",
  "novel_series",
  "novel_book",
  "novel_chapter",
  "novel_codex",
  "novel_codex_item",
  "novel_codex_character",
] as const;
export type KnownObjectType = (typeof KNOWN_OBJECT_TYPES)[number];
export type ObjectType = KnownObjectType | (string & {});

export const object = pgTable(
  "object",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    owner_id: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    domain: text("domain").$type<ObjectDomain>().notNull(),
    type: text("type").$type<ObjectType>().notNull(),
    name: varchar("name", { length: 255 }),
    metadata: jsonb("metadata"),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("object_owner_domain_type_idx").on(table.owner_id, table.domain, table.type)],
);

export const objectRelations = relations(object, ({ one }) => ({
  owner: one(user, {
    fields: [object.owner_id],
    references: [user.id],
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
