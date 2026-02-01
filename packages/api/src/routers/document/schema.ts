import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import type { z } from "zod";

import { document } from "@anle/db/schema/document";

export const documentSchema = {
  create: createInsertSchema(document, {
    title: (schema) => schema.min(1).max(255),
  }),
  update: createUpdateSchema(document, {
    title: (schema) => schema.min(1).max(255),
  })
    .pick({ id: true, title: true })
    .required(),
  delete: createInsertSchema(document, {
    title: (schema) => schema.min(1).max(255),
  })
    .pick({ id: true })
    .required(),
};

export namespace DocumentInput {
  export type Create = z.infer<typeof documentSchema.create>;
  export type Update = z.infer<typeof documentSchema.update>;
  export type Delete = z.infer<typeof documentSchema.delete>;
}
