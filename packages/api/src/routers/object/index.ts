import { protectedProcedure } from "../../index";
import { objectSchema } from "./schema";
import { objectService } from "./service";

export const objectRouter = {
  create: protectedProcedure.input(objectSchema.create).handler(async ({ input, context }) => {
    return await objectService.createObjectForOwner({ input, context });
  }),
  update: protectedProcedure.input(objectSchema.update).handler(async ({ input, context }) => {
    return await objectService.updateObjectForOwner({ input, context });
  }),
  delete: protectedProcedure.input(objectSchema.delete).handler(async ({ input, context }) => {
    return await objectService.deleteObjectForOwner({ input, context });
  }),
};
