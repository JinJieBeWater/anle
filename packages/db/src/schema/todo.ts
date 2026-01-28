import { relations } from "drizzle-orm";
import { pgTable, text, boolean, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const todo = pgTable("todo", {
  id: uuid("id").defaultRandom().primaryKey(),
  text: text("text").notNull(),
  completed: boolean("completed").default(false).notNull(),
  owner_id: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const todoRelations = relations(todo, ({ one }) => ({
  owner: one(user, {
    fields: [todo.owner_id],
    references: [user.id],
  }),
}));
