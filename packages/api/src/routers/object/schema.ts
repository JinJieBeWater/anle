import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";

import { object } from "@anle/db/schema/object";

const objectInsertSchema = createInsertSchema(object, {
  id: z.uuid(),
  name: (schema) => schema.max(255),
});

const updateSchema = createUpdateSchema(object, {
  id: z.uuid(),
  name: (schema) => schema.max(255),
  updated_at: z.date(),
})
  .strict()
  .omit({ created_at: true, owner_id: true });

export const objectSchema = {
  create: objectInsertSchema,
  updateBase: updateSchema,
  update: updateSchema.refine(
    (value) => Object.keys(value).length > 1,
    "object patch cannot be empty",
  ),
  delete: objectInsertSchema.pick({ id: true }),
};

export namespace ObjectInput {
  export type Create = z.infer<typeof objectSchema.create>;
  export type Update = z.infer<typeof objectSchema.update>;
  export type Delete = z.infer<typeof objectSchema.delete>;
}
