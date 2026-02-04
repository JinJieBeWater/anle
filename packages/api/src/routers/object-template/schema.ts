import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";

import { objectTemplate, objectTemplateConfigSchema } from "@anle/db/schema/object-template";

const objectTemplateInsertSchema = createInsertSchema(objectTemplate, {
  id: z.uuid(),
  name: (schema) => schema.min(1).max(255),
  config: () => objectTemplateConfigSchema.optional(),
});

const updateSchema = createUpdateSchema(objectTemplate, {
  id: z.uuid(),
  name: (schema) => schema.min(1).max(255),
  config: () => objectTemplateConfigSchema.optional(),
  updated_at: z.date(),
}).omit({ created_at: true, owner_id: true });

export const objectTemplateSchema = {
  create: objectTemplateInsertSchema,
  updateBase: updateSchema,
  update: updateSchema.refine(
    (value) => Object.keys(value).length > 1,
    "objectTemplate patch cannot be empty",
  ),
  delete: objectTemplateInsertSchema.pick({ id: true }),
};

export namespace ObjectTemplateInput {
  export type Create = z.infer<typeof objectTemplateSchema.create>;
  export type Update = z.infer<typeof objectTemplateSchema.update>;
  export type Delete = z.infer<typeof objectTemplateSchema.delete>;
}
