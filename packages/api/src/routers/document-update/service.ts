import { db } from "@anle/db";
import { documentUpdate } from "@anle/db/schema/document";
import { asc, eq, inArray, sql } from "drizzle-orm";
import * as Y from "yjs";

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
  gcDocumentUpdates: async (input: DocumentUpdateInput.Gc) => {
    return await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${input.document_id})::bigint)`);

      const updates = await tx
        .select({
          id: documentUpdate.id,
          update_data: documentUpdate.update_data,
          created_at: documentUpdate.created_at,
        })
        .from(documentUpdate)
        .where(eq(documentUpdate.document_id, input.document_id))
        .orderBy(asc(documentUpdate.created_at));

      if (updates.length === 0) {
        return {
          success: `0 document_update rows compacted for document_id=${input.document_id}`,
        };
      }

      const updateDatas = updates.map((update) => update.update_data);
      const ydoc = new Y.Doc({ gc: true });
      for (const update of updateDatas) {
        Y.applyUpdateV2(ydoc, update);
      }
      const compactUpdate = Buffer.from(Y.encodeStateAsUpdateV2(ydoc));
      ydoc.destroy();

      const updateIds = updates.map((update) => update.id);
      const latestCreatedAt = updates[updates.length - 1]?.created_at;

      await tx.delete(documentUpdate).where(inArray(documentUpdate.id, updateIds));
      await tx.insert(documentUpdate).values({
        document_id: input.document_id,
        created_at: latestCreatedAt,
        update_data: compactUpdate,
      });

      return {
        success: `${updates.length} document_update rows compacted for document_id=${input.document_id}`,
      };
    });
  },
};
