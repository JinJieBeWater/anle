import { z } from "zod";
import { orpc } from "@/utils/orpc";
import { shouldNeverHappen } from "@/utils/should-never-happen";
import type { TableHandler } from "./types";
import { todo } from "@anle/db/schema/todo";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { numberToBoolean } from "../zod-helpers";

const todoCreateInputSchema = createInsertSchema(todo, {
  completed: numberToBoolean,
}).omit({ id: true });

type TodoCreateInput = z.infer<typeof todoCreateInputSchema>;

const todoPatchSchema = createUpdateSchema(todo, {
  completed: numberToBoolean.optional(),
})
  .strict()
  .omit({ id: true })
  .refine((value) => Object.keys(value).length > 0, "todo patch cannot be empty");

type TodoPatchInput = z.infer<typeof todoPatchSchema>;

export const todoHandler: TableHandler<TodoCreateInput, TodoPatchInput> = {
  putSchema: todoCreateInputSchema,
  patchSchema: todoPatchSchema,
  put: async (op, data) => {
    await orpc.todo.create.call({ id: op.id, text: data.text });
  },
  patch: async (op, data) => {
    const keys = Object.keys(data);
    if (keys.length === 1 && typeof data.completed === "boolean") {
      await orpc.todo.toggle.call({ id: op.id, completed: data.completed });
      return;
    }

    shouldNeverHappen("Unsupported todo patch", data, op);
  },
  remove: async (op) => {
    await orpc.todo.delete.call({ id: op.id });
  },
};
