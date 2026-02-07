import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { UpdateType } from "@powersync/web";

import { shouldNeverHappen } from "@/utils/should-never-happen";
import { orpc } from "@/utils/orpc";
import { createBatcher, createHandler } from "./utils";
import { objectUpdate } from "@anle/db/schema/object-update";
import { stringToDate } from "../zod-helpers";

export const objectUpdateCreateInputSchema = createInsertSchema(objectUpdate, {
  created_at: stringToDate,
  update_data: z.string(),
}).omit({ id: true });

type ObjectUpdateCreateInput = z.infer<typeof objectUpdateCreateInputSchema>;

const objectUpdatePatchSchema = z
  .object({})
  .strict()
  .refine(() => false, "object_update patch is not supported");

export const objectUpdateHandler = createHandler({
  putSchema: objectUpdateCreateInputSchema,
  patchSchema: objectUpdatePatchSchema,
  put: async (_op, _data, _context) => {
    shouldNeverHappen("object_update put is not supported");
  },
  patch: async (_op, _data, _context) => {
    shouldNeverHappen("object_update patch is not supported");
  },
  remove: async (_op, _context) => {
    shouldNeverHappen("object_update remove is not supported");
  },
  buildBatchers: () => [
    createBatcher<ObjectUpdateCreateInput & { id: string }>({
      match: (op) => op.table === "object_update" && op.op === UpdateType.PUT,
      collect: (op) => ({
        ...objectUpdateCreateInputSchema.parse(op.opData),
        id: op.id,
      }),
      flush: async (batchObjectUpdates, _context) => {
        await orpc.objectUpdate.batchCreate.call(batchObjectUpdates);
      },
    }),
    createBatcher<string>({
      match: (op) => op.table === "object_update" && op.op === UpdateType.DELETE,
      collect: (op) => op.id,
      flush: async (batchDeletedObjectUpdateIds) => {
        await orpc.objectUpdate.batchDelete.call(batchDeletedObjectUpdateIds);
      },
    }),
  ],
});
