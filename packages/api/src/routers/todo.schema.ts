import { createUpdateSchema, createInsertSchema } from "drizzle-zod";
import { todo } from "@anle/db/schema/todo";

export const todoCreateInputSchema = createInsertSchema(todo, {
  text: (schema) => schema.min(1).max(255),
}).pick({ id: true, text: true, owner_id: true });

export const todoToggleInputSchema = createUpdateSchema(todo)
  .pick({ id: true, completed: true })
  .required();

export const todoDeleteInputSchema = todoCreateInputSchema.pick({ id: true }).required();
