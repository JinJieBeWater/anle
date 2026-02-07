import { ORPCError } from "@orpc/server";
import { object } from "@anle/db/schema/object";
import { eq } from "drizzle-orm";

import type { ProtectedContext } from "../../index";
import type { ObjectInput } from "./schema";
import { withRls } from "../../rls";

export const objectService = {
  create: async ({ input, context }: { input: ObjectInput.Create; context: ProtectedContext }) => {
    const ownerId = context.session.user.id;
    const value = {
      ...input,
      owner_id: ownerId,
    };
    return await withRls(ownerId, (tx) =>
      tx.insert(object).values(value).onConflictDoUpdate({
        target: object.id,
        set: input,
      }),
    );
  },

  update: async ({ input, context }: { input: ObjectInput.Update; context: ProtectedContext }) => {
    const ownerId = context.session.user.id;
    const result = await withRls(ownerId, (tx) =>
      tx.update(object).set(input).where(eq(object.id, input.id)),
    );
    if ((result.rowCount ?? 0) === 0) {
      throw new ORPCError("NOT_FOUND");
    }
    return result;
  },

  delete: async ({ input, context }: { input: ObjectInput.Delete; context: ProtectedContext }) => {
    const ownerId = context.session.user.id;
    const result = await withRls(ownerId, (tx) => tx.delete(object).where(eq(object.id, input.id)));
    if ((result.rowCount ?? 0) === 0) {
      throw new ORPCError("NOT_FOUND");
    }
    return result;
  },
};
