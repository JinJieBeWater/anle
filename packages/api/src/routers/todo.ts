import { db } from "@anle/db";
import { todo } from "@anle/db/schema/todo";
import { eq } from "drizzle-orm";
import { publicProcedure } from "../index";
import { todoCreateInputSchema, todoDeleteInputSchema, todoToggleInputSchema } from "./todo.schema";

export const todoRouter = {
  getAll: publicProcedure.handler(async () => {
    return await db.select().from(todo);
  }),

  create: publicProcedure.input(todoCreateInputSchema).handler(async ({ input }) => {
    return await db.insert(todo).values({
      id: input.id,
      text: input.text,
      owner_id: input.owner_id,
    });
  }),

  toggle: publicProcedure.input(todoToggleInputSchema).handler(async ({ input }) => {
    return await db.update(todo).set({ completed: input.completed }).where(eq(todo.id, input.id));
  }),

  delete: publicProcedure.input(todoDeleteInputSchema).handler(async ({ input }) => {
    return await db.delete(todo).where(eq(todo.id, input.id));
  }),
};
