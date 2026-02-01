import { db } from "@anle/db";
import { documentUpdate } from "@anle/db/schema/document";
import { inArray } from "drizzle-orm";

import type { DocumentUpdateInput } from "./schema";

export const documentUpdateService = {
  createDocumentUpdate: async (input: DocumentUpdateInput.Create) => {
    const value = {
      ...input,
      update_data: Buffer.from(input.update_data, "base64"),
    };
    return await db.insert(documentUpdate).values(value);
  },
  batchCreateDocumentUpdates: async (input: DocumentUpdateInput.BatchCreate) => {
    const values = input.map((item) => ({
      ...item,
      update_data: Buffer.from(item.update_data, "base64"),
    }));
    return await db.insert(documentUpdate).values(values);
  },
  batchDeleteDocumentUpdates: async (input: DocumentUpdateInput.BatchDelete) => {
    if (input.length === 0) {
      return { deleted: 0 };
    }
    const result = await db.delete(documentUpdate).where(inArray(documentUpdate.id, input));
    return { deleted: result.rowCount ?? 0 };
  },
};
