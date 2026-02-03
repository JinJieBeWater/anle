import { createInsertSchema } from "drizzle-zod";

import { objectUpdate } from "@anle/db/schema/object-update";
import z from "zod";

export const objectUpdateSchema = {
  create: createInsertSchema(objectUpdate, {
    update_data: z.string(),
  }),
  batchCreate: z.array(
    createInsertSchema(objectUpdate, {
      update_data: z.string(),
    }),
  ),
  batchDelete: z.array(z.uuid()),
};

export namespace ObjectUpdateInput {
  export type Create = z.infer<typeof objectUpdateSchema.create>;
  export type BatchCreate = z.infer<typeof objectUpdateSchema.batchCreate>;
  export type BatchDelete = z.infer<typeof objectUpdateSchema.batchDelete>;
}
