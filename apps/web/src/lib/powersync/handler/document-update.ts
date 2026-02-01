import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { UpdateType } from "@powersync/web";

import { shouldNeverHappen } from "@/utils/should-never-happen";
import { orpc } from "@/utils/orpc";
import { createBatcher, createHandler } from "./utils";
import { documentUpdate } from "@anle/db/schema/document";
import { stringToDate } from "../zod-helpers";

export const documentUpdateCreateInputSchema = createInsertSchema(documentUpdate, {
  created_at: stringToDate,
  update_data: z.string(),
}).omit({ id: true });

type DocumentUpdateCreateInput = z.infer<typeof documentUpdateCreateInputSchema>;

const documentUpdatePatchSchema = z
  .object({})
  .strict()
  .refine(() => false, "document_update patch is not supported");

export const documentUpdateHandler = createHandler({
  putSchema: documentUpdateCreateInputSchema,
  patchSchema: documentUpdatePatchSchema,
  put: async (_op, _data, _context) => {
    shouldNeverHappen("document_update put is not supported");
  },
  patch: async (_op, _data, _context) => {
    shouldNeverHappen("document_update patch is not supported");
  },
  remove: async (_op, _context) => {
    shouldNeverHappen("document_update remove is not supported");
  },
  buildBatchers: () => [
    createBatcher<DocumentUpdateCreateInput & { id: string }>({
      match: (op) => op.table === "document_update" && op.op === UpdateType.PUT,
      collect: (op) => ({
        ...documentUpdateCreateInputSchema.parse(op.opData),
        id: op.id,
      }),
      flush: async (batchDocumentUpdates) => {
        await orpc.documentUpdate.batchCreate.call(batchDocumentUpdates);
      },
    }),
    createBatcher<string>({
      match: (op) => op.table === "document_update" && op.op === UpdateType.DELETE,
      collect: (op) => op.id,
      flush: async (batchDeletedDocumentUpdateIds) => {
        await orpc.documentUpdate.batchDelete.call(batchDeletedDocumentUpdateIds);
      },
    }),
  ],
});
