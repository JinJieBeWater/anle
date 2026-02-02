import { createInsertSchema } from "drizzle-zod";

import { yjsUpdate } from "@anle/db/schema/yjs-update";
import z from "zod";

export const yjsUpdateSchema = {
  create: createInsertSchema(yjsUpdate, {
    update_data: z.string(),
  }),
  batchCreate: z.array(
    createInsertSchema(yjsUpdate, {
      update_data: z.string(),
    }),
  ),
  batchDelete: z.array(z.uuid()),
};

export namespace YjsUpdateInput {
  export type Create = z.infer<typeof yjsUpdateSchema.create>;
  export type BatchCreate = z.infer<typeof yjsUpdateSchema.batchCreate>;
  export type BatchDelete = z.infer<typeof yjsUpdateSchema.batchDelete>;
}
