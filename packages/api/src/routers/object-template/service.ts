import { ORPCError } from "@orpc/server";
import { objectTemplate } from "@anle/db/schema/object-template";
import { eq } from "drizzle-orm";

import type { ProtectedContext } from "../../index";
import type { ObjectTemplateInput } from "./schema";
import { withRls } from "../../rls";

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
    return await withRls(ownerId, (tx) =>
      tx.insert(objectTemplate).values(value).onConflictDoUpdate({
        target: objectTemplate.id,
        set: input,
      }),
    );
  },

  update: async ({
    input,
    context,
  }: {
    input: ObjectTemplateInput.Update;
    context: ProtectedContext;
  }) => {
    const ownerId = context.session.user.id;
    const result = await withRls(ownerId, (tx) =>
      tx.update(objectTemplate).set(input).where(eq(objectTemplate.id, input.id)),
    );
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
    const result = await withRls(ownerId, (tx) =>
      tx.delete(objectTemplate).where(eq(objectTemplate.id, input.id)),
    );
    if ((result.rowCount ?? 0) === 0) {
      throw new ORPCError("NOT_FOUND");
    }
    return result;
  },
};
