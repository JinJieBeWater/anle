import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { bytea } from "./custom-types";

export const document = pgTable("document", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const documentUpdate = pgTable(
  "document_update",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    document_id: uuid("document_id")
      .notNull()
      .references(() => document.id, { onDelete: "cascade" }),
    update_data: bytea("update_data").notNull(),
  },
  (table) => [index("document_update_document_id_idx").on(table.document_id)],
);

export const documentRelations = relations(document, ({ many }) => ({
  updates: many(documentUpdate),
}));

export const documentUpdateRelations = relations(documentUpdate, ({ one }) => ({
  document: one(document, {
    fields: [documentUpdate.document_id],
    references: [document.id],
  }),
}));
