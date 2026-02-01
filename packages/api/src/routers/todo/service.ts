import { db } from "@anle/db";
import { todo } from "@anle/db/schema/todo";
import { eq } from "drizzle-orm";
import type { TodoInput } from "./schema";

export const todoService = {
  getTodos: async () => {
    return await db.select().from(todo);
  },
  createTodo: async (input: TodoInput.Create) => {
    return await db.insert(todo).values(input).onConflictDoUpdate({
      target: todo.id,
      set: input,
    });
  },
  toggleTodo: async (input: TodoInput.Toggle) => {
    return await db.update(todo).set(input).where(eq(todo.id, input.id));
  },
  deleteTodo: async (input: TodoInput.Delete) => {
    return await db.delete(todo).where(eq(todo.id, input.id));
  },
};
