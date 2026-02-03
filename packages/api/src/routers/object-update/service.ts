import { ORPCError } from "@orpc/server";
import { db } from "@anle/db";
import { objectUpdate } from "@anle/db/schema/object-update";
import { and, eq, inArray } from "drizzle-orm";

import type { ProtectedContext } from "../../index";
import type { ObjectUpdateInput } from "./schema";

export const objectUpdateService = {
  createObjectUpdateForOwner: async ({
    input,
    context,
  }: {
    input: ObjectUpdateInput.Create;
    context: ProtectedContext;
  }) => {
    const ownerId = context.session.user.id;
    return await objectUpdateService.createObjectUpdate({
      ...input,
      owner_id: ownerId,
    });
  },

  batchCreateObjectUpdatesForOwner: async ({
    input,
    context,
  }: {
    input: ObjectUpdateInput.BatchCreate;
    context: ProtectedContext;
  }) => {
    const ownerId = context.session.user.id;
    return await objectUpdateService.batchCreateObjectUpdates(
      input.map((item) => ({
        ...item,
        owner_id: ownerId,
      })),
    );
  },

  batchDeleteObjectUpdatesForOwner: async ({
    input,
    context,
  }: {
    input: ObjectUpdateInput.BatchDelete;
    context: ProtectedContext;
  }) => {
    const ownerId = context.session.user.id;
    if (input.length > 0) {
      const allowed = await db
        .select({ id: objectUpdate.id })
        .from(objectUpdate)
        .where(and(eq(objectUpdate.owner_id, ownerId), inArray(objectUpdate.id, input)));
      if (allowed.length !== input.length) {
        throw new ORPCError("FORBIDDEN");
      }
    }
    return await objectUpdateService.batchDeleteObjectUpdates(input);
  },

  createObjectUpdate: async (input: ObjectUpdateInput.Create) => {
    const value = {
      ...input,
      update_data: Buffer.from(input.update_data, "base64"),
    };
    return await db.insert(objectUpdate).values(value);
  },

  batchCreateObjectUpdates: async (input: ObjectUpdateInput.BatchCreate) => {
    const values = input.map((item) => ({
      ...item,
      update_data: Buffer.from(item.update_data, "base64"),
    }));
    return await db.insert(objectUpdate).values(values);
  },

  batchDeleteObjectUpdates: async (input: ObjectUpdateInput.BatchDelete) => {
    if (input.length === 0) {
      return { deleted: 0 };
    }
    const result = await db.delete(objectUpdate).where(inArray(objectUpdate.id, input));
    return { deleted: result.rowCount ?? 0 };
  },
};
