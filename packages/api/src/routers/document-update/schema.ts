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
  gc: createInsertSchema(documentUpdate, {
    update_data: z.string(),
  })
    .pick({
      document_id: true,
    })
    .required(),
};

export namespace DocumentUpdateInput {
  export type Create = z.infer<typeof documentUpdateSchema.create>;
  export type BatchCreate = z.infer<typeof documentUpdateSchema.batchCreate>;
  export type Gc = z.infer<typeof documentUpdateSchema.gc>;
}
