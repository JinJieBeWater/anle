import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

import { shouldNeverHappen } from "@/utils/should-never-happen";
import type { TableHandler } from "../types";
import { documentUpdate } from "@anle/db/schema/document";
import { stringToDate } from "../zod-helpers";

export const documentUpdateCreateInputSchema = createInsertSchema(documentUpdate, {
  created_at: stringToDate,
  update_data: z.string(),
}).omit({ id: true });

const documentUpdateBatchCreateInputSchema = z.array(documentUpdateCreateInputSchema);

type DocumentUpdateBatchCreateInput = z.infer<typeof documentUpdateBatchCreateInputSchema>;

const documentUpdatePatchSchema = z
  .object({})
  .strict()
  .refine(() => false, "document_update patch is not supported");

type DocumentUpdatePatchInput = z.infer<typeof documentUpdatePatchSchema>;

export const documentUpdateHandler: TableHandler<
  DocumentUpdateBatchCreateInput,
  DocumentUpdatePatchInput
> = {
  putSchema: documentUpdateBatchCreateInputSchema,
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
};
