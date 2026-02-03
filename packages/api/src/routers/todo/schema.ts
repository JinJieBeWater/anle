import { createUpdateSchema, createInsertSchema } from "drizzle-zod";
import { todo } from "@anle/db/schema/todo";
import type { z } from "zod";

export const todoSchema = {
  create: createInsertSchema(todo, {
    text: (schema) => schema.min(1).max(255),
  }).pick({ id: true, text: true, owner_id: true }),
  toggle: createUpdateSchema(todo).pick({ id: true, completed: true }).required(),
  delete: createInsertSchema(todo).pick({ id: true }).required(),
};

export namespace TodoInput {
  export type Create = z.infer<typeof todoSchema.create>;
  export type Toggle = z.infer<typeof todoSchema.toggle>;
  export type Delete = z.infer<typeof todoSchema.delete>;
}
