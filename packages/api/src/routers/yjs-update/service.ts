import { db } from "@anle/db";
import { yjsUpdate } from "@anle/db/schema/yjs-update";
import { inArray } from "drizzle-orm";

import type { YjsUpdateInput } from "./schema";

export const yjsUpdateService = {
  createYjsUpdate: async (input: YjsUpdateInput.Create) => {
    const value = {
      ...input,
      update_data: Buffer.from(input.update_data, "base64"),
    };
    return await db.insert(yjsUpdate).values(value);
  },
  batchCreateYjsUpdates: async (input: YjsUpdateInput.BatchCreate) => {
    const values = input.map((item) => ({
      ...item,
      update_data: Buffer.from(item.update_data, "base64"),
    }));
    return await db.insert(yjsUpdate).values(values);
  },
  batchDeleteYjsUpdates: async (input: YjsUpdateInput.BatchDelete) => {
    if (input.length === 0) {
      return { deleted: 0 };
    }
    const result = await db.delete(yjsUpdate).where(inArray(yjsUpdate.id, input));
    return { deleted: result.rowCount ?? 0 };
  },
};
