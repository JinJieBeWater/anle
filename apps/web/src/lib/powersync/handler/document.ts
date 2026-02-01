import { z } from "zod";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { orpc } from "@/utils/orpc";
import { shouldNeverHappen } from "@/utils/should-never-happen";
import type { TableHandler } from "../types";
import { document } from "@anle/db/schema/document";
import { stringToDate } from "../zod-helpers";

const documentCreateInputSchema = createInsertSchema(document, {
  title: (schema) => schema.min(1).max(255),
  created_at: stringToDate,
}).omit({ id: true });

type DocumentCreateInput = z.infer<typeof documentCreateInputSchema>;

const documentPatchSchema = createUpdateSchema(document, {
  title: (schema) => schema.min(1).max(255).optional(),
})
  .strict()
  .omit({ id: true, created_at: true })
  .refine((value) => Object.keys(value).length > 0, "document patch cannot be empty");

type DocumentPatchInput = z.infer<typeof documentPatchSchema>;

export const documentHandler: TableHandler<DocumentCreateInput, DocumentPatchInput> = {
  putSchema: documentCreateInputSchema,
  patchSchema: documentPatchSchema,
  put: async (op, data, _context) => {
    await orpc.document.create.call({
      id: op.id,
      title: data.title,
      created_at: data.created_at,
    });
  },
  patch: async (op, data, _context) => {
    if (typeof data.title === "string") {
      await orpc.document.updateTitle.call({ id: op.id, title: data.title });
      return;
    }

    shouldNeverHappen("Unsupported document patch", data, op);
  },
  remove: async (op, _context) => {
    await orpc.document.delete.call({ id: op.id });
  },
};
