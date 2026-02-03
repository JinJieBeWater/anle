import { ORPCError } from "@orpc/server";
import { db } from "@anle/db";
import { object } from "@anle/db/schema/object";
import { eq } from "drizzle-orm";

import type { ProtectedContext } from "../../index";
import type { ObjectInput } from "./schema";

export const objectService = {
  createObjectForOwner: async ({
    input,
    context,
  }: {
    input: ObjectInput.Create;
    context: ProtectedContext;
  }) => {
    const ownerId = context.session.user.id;
    return await objectService.createObject({
      ...input,
      owner_id: ownerId,
    });
  },

  updateObjectForOwner: async ({
    input,
    context,
  }: {
    input: ObjectInput.Update;
    context: ProtectedContext;
  }) => {
    const ownerId = context.session.user.id;
    const record = await db
      .select({ owner_id: object.owner_id })
      .from(object)
      .where(eq(object.id, input.id))
      .limit(1);
    const row = record[0];
    if (!row) {
      throw new ORPCError("NOT_FOUND");
    }
    if (row.owner_id !== ownerId) {
      throw new ORPCError("FORBIDDEN");
    }
    return await objectService.updateObject(input);
  },

  deleteObjectForOwner: async ({
    input,
    context,
  }: {
    input: ObjectInput.Delete;
    context: ProtectedContext;
  }) => {
    const ownerId = context.session.user.id;
    const record = await db
      .select({ owner_id: object.owner_id })
      .from(object)
      .where(eq(object.id, input.id))
      .limit(1);
    const row = record[0];
    if (!row) {
      throw new ORPCError("NOT_FOUND");
    }
    if (row.owner_id !== ownerId) {
      throw new ORPCError("FORBIDDEN");
    }
    return await objectService.deleteObject(input);
  },

  createObject: async (input: ObjectInput.Create) => {
    return await db.insert(object).values(input).onConflictDoUpdate({
      target: object.id,
      set: input,
    });
  },

  updateObject: async (input: ObjectInput.Update) => {
    return await db.update(object).set(input).where(eq(object.id, input.id));
  },

  deleteObject: async (input: ObjectInput.Delete) => {
    return await db.delete(object).where(eq(object.id, input.id));
  },
};
