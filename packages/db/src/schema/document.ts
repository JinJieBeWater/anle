import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const document = pgTable("document", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
