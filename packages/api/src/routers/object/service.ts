import { ORPCError } from "@orpc/server";
import { db } from "@anle/db";
import { object } from "@anle/db/schema/object";
import { and, eq } from "drizzle-orm";

import type { ProtectedContext } from "../../index";
import type { ObjectInput } from "./schema";

export const objectService = {
  create: async ({ input, context }: { input: ObjectInput.Create; context: ProtectedContext }) => {
    const ownerId = context.session.user.id;
    const value = {
      ...input,
      owner_id: ownerId,
    };
    return await db
      .insert(object)
      .values(value)
      .onConflictDoUpdate({
        target: object.id,
        set: input,
        setWhere: and(eq(object.owner_id, ownerId)),
      });
  },

  update: async ({ input, context }: { input: ObjectInput.Update; context: ProtectedContext }) => {
    const ownerId = context.session.user.id;
    const result = await db
      .update(object)
      .set(input)
      .where(and(eq(object.id, input.id), eq(object.owner_id, ownerId)));
    if ((result.rowCount ?? 0) === 0) {
      throw new ORPCError("NOT_FOUND");
    }
    return result;
  },

  delete: async ({ input, context }: { input: ObjectInput.Delete; context: ProtectedContext }) => {
    const ownerId = context.session.user.id;
    const result = await db
      .delete(object)
      .where(and(eq(object.id, input.id), eq(object.owner_id, ownerId)));
    if ((result.rowCount ?? 0) === 0) {
      throw new ORPCError("NOT_FOUND");
    }
    return result;
  },
};
