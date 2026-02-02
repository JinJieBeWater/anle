import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { UpdateType } from "@powersync/web";

import { shouldNeverHappen } from "@/utils/should-never-happen";
import { orpc } from "@/utils/orpc";
import { createBatcher, createHandler } from "./utils";
import { yjsUpdate } from "@anle/db/schema/yjs-update";
import { stringToDate } from "../zod-helpers";

export const yjsUpdateCreateInputSchema = createInsertSchema(yjsUpdate, {
  created_at: stringToDate,
  update_data: z.string(),
}).omit({ id: true });

type YjsUpdateCreateInput = z.infer<typeof yjsUpdateCreateInputSchema>;

const yjsUpdatePatchSchema = z
  .object({})
  .strict()
  .refine(() => false, "yjs_update patch is not supported");

export const yjsUpdateHandler = createHandler({
  putSchema: yjsUpdateCreateInputSchema,
  patchSchema: yjsUpdatePatchSchema,
  put: async (_op, _data, _context) => {
    shouldNeverHappen("yjs_update put is not supported");
  },
  patch: async (_op, _data, _context) => {
    shouldNeverHappen("yjs_update patch is not supported");
  },
  remove: async (_op, _context) => {
    shouldNeverHappen("yjs_update remove is not supported");
  },
  buildBatchers: () => [
    createBatcher<YjsUpdateCreateInput & { id: string }>({
      match: (op) => op.table === "yjs_update" && op.op === UpdateType.PUT,
      collect: (op) => ({
        ...yjsUpdateCreateInputSchema.parse(op.opData),
        id: op.id,
      }),
      flush: async (batchYjsUpdates) => {
        await orpc.yjsUpdate.batchCreate.call(batchYjsUpdates);
      },
    }),
    createBatcher<string>({
      match: (op) => op.table === "yjs_update" && op.op === UpdateType.DELETE,
      collect: (op) => op.id,
      flush: async (batchDeletedYjsUpdateIds) => {
        await orpc.yjsUpdate.batchDelete.call(batchDeletedYjsUpdateIds);
      },
    }),
  ],
});
