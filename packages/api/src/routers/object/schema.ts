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

const templateFieldSchema = z.object({
  key: z.string(),
  type: z.string(),
  required: z.boolean().optional(),
  default: z.unknown().optional(),
  options: z.array(z.unknown()).optional(),
});

const templateObjectSchema = z.object({
  type: z.string(),
  label: z.string().optional(),
  metadataFields: z.array(templateFieldSchema).optional(),
});

export const templateMetadataVersionSchema = z.object({
  version: z.number(),
  objects: z.array(templateObjectSchema),
});

export const objectTemplateMetadataSchema = z.object({
  versions: z.array(templateMetadataVersionSchema),
});

export namespace ObjectInput {
  export type Create = z.infer<typeof objectSchema.create>;
  export type Update = z.infer<typeof objectSchema.update>;
  export type Delete = z.infer<typeof objectSchema.delete>;
}
