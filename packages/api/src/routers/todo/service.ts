import { db } from "@anle/db";
import { todo } from "@anle/db/schema/todo";
import { eq } from "drizzle-orm";
import type { TodoInput } from "./schema";

export const todoService = {
  getTodos: async () => {
    return await db.select().from(todo);
  },
  create: async (input: TodoInput.Create) => {
    return await db
      .insert(todo)
      .values(input)
      .onConflictDoUpdate({
        target: todo.id,
        set: input,
        setWhere: eq(todo.owner_id, input.owner_id),
      });
  },
  toggle: async (input: TodoInput.Toggle) => {
    return await db.update(todo).set(input).where(eq(todo.id, input.id));
  },
  delete: async (input: TodoInput.Delete) => {
    return await db.delete(todo).where(eq(todo.id, input.id));
  },
};
