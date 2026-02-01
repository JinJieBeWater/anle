import { db } from "@anle/db";
import { document } from "@anle/db/schema/document";
import { eq } from "drizzle-orm";
import type { DocumentInput } from "./schema";

export const documentService = {
  createDocument: async (input: DocumentInput.Create) => {
    return await db.insert(document).values(input).onConflictDoUpdate({
      target: document.id,
      set: input,
    });
  },
  updateDocumentTitle: async (input: DocumentInput.Update) => {
    return await db.update(document).set(input).where(eq(document.id, input.id));
  },
  deleteDocument: async (input: DocumentInput.Delete) => {
    return await db.delete(document).where(eq(document.id, input.id));
  },
};
