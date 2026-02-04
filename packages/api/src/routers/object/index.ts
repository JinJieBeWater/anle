import { protectedProcedure } from "../../index";
import { objectSchema } from "./schema";
import { objectService } from "./service";

export const objectRouter = {
  create: protectedProcedure.input(objectSchema.create).handler(async ({ input, context }) => {
    return await objectService.create({ input, context });
  }),
  update: protectedProcedure.input(objectSchema.update).handler(async ({ input, context }) => {
    return await objectService.update({ input, context });
  }),
  delete: protectedProcedure.input(objectSchema.delete).handler(async ({ input, context }) => {
    return await objectService.delete({ input, context });
  }),
};
