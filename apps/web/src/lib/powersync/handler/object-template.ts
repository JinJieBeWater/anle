import { objectTemplateSchema } from "@anle/api/routers/object-template/schema";
import { orpc } from "@/utils/orpc";
import { createHandler } from "./utils";
import { nullableStringToJson, stringToDate } from "../zod-helpers";
import { objectTemplateConfigSchema } from "@anle/db/schema/object-template";

const objectTemplateCreateInputSchema = objectTemplateSchema.create
  .extend({
    created_at: stringToDate,
    updated_at: stringToDate,
    config: nullableStringToJson.pipe(objectTemplateConfigSchema.nullish()),
  })
  .omit({ id: true });

const objectTemplatePatchSchema = objectTemplateSchema.updateBase
  .extend({
    updated_at: stringToDate,
    config: nullableStringToJson.pipe(objectTemplateConfigSchema.nullish()),
  })
  .omit({ id: true })
  .refine(
    (value) => Object.keys(value).length > 1,
    "objectTemplate patch cannot be empty or only contain updated_at",
  );

export const objectTemplateHandler = createHandler({
  putSchema: objectTemplateCreateInputSchema,
  patchSchema: objectTemplatePatchSchema,
  put: async (op, data, context) => {
    const { owner_id: _ignored, ...rest } = data;
    const ownerId = context.session.user.id;
    await orpc.objectTemplate.create.call({
      id: op.id,
      ...rest,
      owner_id: ownerId,
    });
  },
  patch: async (op, data) => {
    await orpc.objectTemplate.update.call({
      id: op.id,
      ...data,
    });
  },
  remove: async (op) => {
    await orpc.objectTemplate.delete.call({ id: op.id });
  },
});
