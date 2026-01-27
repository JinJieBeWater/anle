import { column, Table } from "@powersync/web";
import { z } from "zod";

import { numberToBoolean } from "../zod-helpers";
import { todo } from "@anle/db/schema/todo";
import { createSelectSchema } from "drizzle-zod";

export const TODO_TABLE_DEFINITION = new Table({
  text: column.text,
  completed: column.integer,
});

export const TodoSchema = createSelectSchema(todo);

export const TodoDeserializationSchema = z.object({
  ...TodoSchema.shape,
  completed: numberToBoolean,
});

export type TodoRecord = z.output<typeof TodoSchema>;
