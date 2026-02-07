import { objectUpdate } from "@anle/db/schema/object-update";
import { inArray } from "drizzle-orm";

import type { ProtectedContext } from "../../index";
import type { ObjectUpdateInput } from "./schema";
import { withRls } from "../../rls";

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
      update_data: Buffer.from(input.update_data, "base64"),
    };
    return await withRls(ownerId, (tx) => tx.insert(objectUpdate).values(value));
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
      update_data: Buffer.from(item.update_data, "base64"),
    }));
    return await withRls(ownerId, (tx) => tx.insert(objectUpdate).values(values));
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
    const result = await withRls(ownerId, (tx) =>
      tx.delete(objectUpdate).where(inArray(objectUpdate.id, input)),
    );
    return { deleted: result.rowCount ?? 0 };
  },
};
