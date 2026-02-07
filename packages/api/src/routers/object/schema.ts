import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";

import { object } from "@anle/db/schema/object";

const knownTypes = ["novel", "volume", "chapter"] as const;

const objectInsertSchema = createInsertSchema(object, {
  id: z.uuid(),
  name: (schema) => schema.trim().min(1, "Label is required").max(255, "Label is too long"),
  type: z.enum(knownTypes),
});

const updateSchema = createUpdateSchema(object, {
  id: z.uuid(),
  name: (schema) => schema.trim().min(1, "Label is required").max(255, "Label is too long"),
  updated_at: z.date(),
  type: z.enum(knownTypes),
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
