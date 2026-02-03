import { objectSchema } from "@anle/api/routers/object/schema";
import { orpc } from "@/utils/orpc";
import { createHandler } from "./utils";
import { stringToDate } from "../zod-helpers";

const objectCreateInputSchema = objectSchema.create
  .extend({
    created_at: stringToDate,
    updated_at: stringToDate,
  })
  .omit({ id: true });

const objectPatchSchema = objectSchema.updateBase
  .extend({
    updated_at: stringToDate,
  })
  .omit({ id: true })
  .refine((value) => Object.keys(value).length > 0, "object patch cannot be empty");

export const objectHandler = createHandler({
  putSchema: objectCreateInputSchema,
  patchSchema: objectPatchSchema,
  put: async (op, data, context) => {
    const { owner_id: _ignored, ...rest } = data;
    const ownerId = context.session.user.id;
    await orpc.object.create.call({
      id: op.id,
      ...rest,
      owner_id: ownerId,
    });
  },
  patch: async (op, data) => {
    await orpc.object.update.call({
      id: op.id,
      ...data,
    });
  },
  remove: async (op) => {
    await orpc.object.delete.call({ id: op.id });
  },
});
