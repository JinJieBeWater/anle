import { column } from "@powersync/web";
import { z } from "zod";

import { numberToBoolean } from "../zod-helpers";
import type { TableDefinition } from "../types";
import { todo } from "@anle/db/schema/todo";
import { createSelectSchema } from "drizzle-zod";

export const TODO_TABLE_DEF: TableDefinition = {
  name: "todo",
  columns: {
    text: column.text,
    completed: column.integer,
    owner_id: column.text,
  },
};

export const TodoSchema = createSelectSchema(todo);

export const TodoDeserializationSchema = z.object({
  ...TodoSchema.shape,
  completed: numberToBoolean,
});

export type TodoRecord = z.output<typeof TodoSchema>;
