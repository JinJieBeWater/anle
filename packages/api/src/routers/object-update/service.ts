import { db } from "@anle/db";
import { objectUpdate } from "@anle/db/schema/object-update";
import { and, eq, inArray } from "drizzle-orm";

import type { ProtectedContext } from "../../index";
import type { ObjectUpdateInput } from "./schema";

export const objectUpdateService = {
  create: async ({
    input,
    context,
  }: {
    input: ObjectUpdateInput.Create;
    context: ProtectedContext;
  }) => {
    const ownerId = context.session.user.id;
    const value = {
      ...input,
      owner_id: ownerId,
      update_data: Buffer.from(input.update_data, "base64"),
    };
    return await db.insert(objectUpdate).values(value);
  },

  batchCreate: async ({
    input,
    context,
  }: {
    input: ObjectUpdateInput.BatchCreate;
    context: ProtectedContext;
  }) => {
    const ownerId = context.session.user.id;
    const values = input.map((item) => ({
      ...item,
      owner_id: ownerId,
      update_data: Buffer.from(item.update_data, "base64"),
    }));
    return await db.insert(objectUpdate).values(values);
  },

  batchDelete: async ({
    input,
    context,
  }: {
    input: ObjectUpdateInput.BatchDelete;
    context: ProtectedContext;
  }) => {
    const ownerId = context.session.user.id;
    if (input.length === 0) {
      return { deleted: 0 };
    }
    const result = await db
      .delete(objectUpdate)
      .where(and(eq(objectUpdate.owner_id, ownerId), inArray(objectUpdate.id, input)));
    return { deleted: result.rowCount ?? 0 };
  },
};
