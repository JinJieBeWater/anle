import { protectedProcedure } from "../../index";
import { objectTemplateSchema } from "./schema";
import { objectTemplateService } from "./service";

export const objectTemplateRouter = {
  create: protectedProcedure
    .input(objectTemplateSchema.create)
    .handler(async ({ input, context }) => {
      return await objectTemplateService.create({ input, context });
    }),
  update: protectedProcedure
    .input(objectTemplateSchema.update)
    .handler(async ({ input, context }) => {
      return await objectTemplateService.update({ input, context });
    }),
  delete: protectedProcedure
    .input(objectTemplateSchema.delete)
    .handler(async ({ input, context }) => {
      return await objectTemplateService.delete({ input, context });
    }),
};
