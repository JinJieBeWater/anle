import { orpc } from "@/utils/orpc";
import { shouldNeverHappen } from "@/utils/should-never-happen";
import { createHandler } from "./utils";
import { todo } from "@anle/db/schema/todo";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { numberToBoolean } from "../zod-helpers";

const todoCreateInputSchema = createInsertSchema(todo, {
  completed: numberToBoolean,
}).omit({ id: true });

const todoPatchSchema = createUpdateSchema(todo, {
  completed: numberToBoolean.optional(),
})
  .strict()
  .omit({ id: true })
  .refine((value) => Object.keys(value).length > 0, "todo patch cannot be empty");

export const todoHandler = createHandler({
  putSchema: todoCreateInputSchema,
  patchSchema: todoPatchSchema,
  put: async (op, data, _context) => {
    console.log("put", op, data);
    await orpc.todo.create.call({ id: op.id, text: data.text, owner_id: data.owner_id });
  },
  patch: async (op, data, _context) => {
    console.log("patch", op, data);
    const keyLength = Object.keys(data).length;
    const { completed } = data;
    if (keyLength === 1 && typeof completed === "boolean") {
      await orpc.todo.toggle.call({ id: op.id, completed: completed });
      return;
    }

    shouldNeverHappen("Unsupported todo patch", data, op);
  },
  remove: async (op, _context) => {
    await orpc.todo.delete.call({ id: op.id });
  },
});
