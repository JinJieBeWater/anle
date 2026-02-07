import { createInsertSchema } from "drizzle-zod";

import { objectUpdate } from "@anle/db/schema/object-update";
import z from "zod";

export const objectUpdateSchema = {
  create: createInsertSchema(objectUpdate, {
    update_data: z.string(),
    field_key: z.string().min(1),
  }),
  batchCreate: z.array(
    createInsertSchema(objectUpdate, {
      update_data: z.string(),
      field_key: z.string().min(1),
    }),
  ),
  batchDelete: z.array(z.uuid()),
};

export namespace ObjectUpdateInput {
  export type Create = z.infer<typeof objectUpdateSchema.create>;
  export type BatchCreate = z.infer<typeof objectUpdateSchema.batchCreate>;
  export type BatchDelete = z.infer<typeof objectUpdateSchema.batchDelete>;
}
