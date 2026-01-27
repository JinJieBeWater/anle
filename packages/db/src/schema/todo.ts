import { pgTable, text, boolean, uuid } from "drizzle-orm/pg-core";

export const todo = pgTable("todo", {
  id: uuid("id").defaultRandom().primaryKey(),
  text: text("text").notNull(),
  completed: boolean("completed").default(false).notNull(),
});
