import { ORPCError } from "@orpc/server";
import { db } from "@anle/db";
import { objectTemplate } from "@anle/db/schema/object-template";
import { and, eq } from "drizzle-orm";

import type { ProtectedContext } from "../../index";
import type { ObjectTemplateInput } from "./schema";

export const objectTemplateService = {
  create: async ({
    input,
    context,
  }: {
    input: ObjectTemplateInput.Create;
    context: ProtectedContext;
  }) => {
    const ownerId = context.session.user.id;
    const value = {
      ...input,
      owner_id: ownerId,
    };
    return await db
      .insert(objectTemplate)
      .values(value)
      .onConflictDoUpdate({
        target: objectTemplate.id,
        set: input,
        setWhere: and(eq(objectTemplate.owner_id, ownerId)),
      });
  },

  update: async ({
    input,
    context,
  }: {
    input: ObjectTemplateInput.Update;
    context: ProtectedContext;
  }) => {
    const ownerId = context.session.user.id;
    const result = await db
      .update(objectTemplate)
      .set(input)
      .where(and(eq(objectTemplate.id, input.id), eq(objectTemplate.owner_id, ownerId)));
    if ((result.rowCount ?? 0) === 0) {
      throw new ORPCError("NOT_FOUND");
    }
    return result;
  },

  delete: async ({
    input,
    context,
  }: {
    input: ObjectTemplateInput.Delete;
    context: ProtectedContext;
  }) => {
    const ownerId = context.session.user.id;
    const result = await db
      .delete(objectTemplate)
      .where(and(eq(objectTemplate.id, input.id), eq(objectTemplate.owner_id, ownerId)));
    if ((result.rowCount ?? 0) === 0) {
      throw new ORPCError("NOT_FOUND");
    }
    return result;
  },
};
