import { createInsertSchema } from "drizzle-zod";

import { documentUpdate } from "@anle/db/schema/document";
import z from "zod";

export const documentUpdateSchema = {
  create: createInsertSchema(documentUpdate, {
    update_data: z.string(),
  }),
  batchCreate: z.array(
    createInsertSchema(documentUpdate, {
      update_data: z.string(),
    }),
  ),
  batchDelete: z.array(z.uuid()),
};

export namespace DocumentUpdateInput {
  export type Create = z.infer<typeof documentUpdateSchema.create>;
  export type BatchCreate = z.infer<typeof documentUpdateSchema.batchCreate>;
  export type BatchDelete = z.infer<typeof documentUpdateSchema.batchDelete>;
}
