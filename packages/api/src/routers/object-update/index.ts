import { protectedProcedure } from "../../index";
import { objectUpdateService } from "./service";
import { objectUpdateSchema } from "./schema";

export const objectUpdateRouter = {
  create: protectedProcedure
    .input(objectUpdateSchema.create)
    .handler(async ({ input, context }) => {
      return await objectUpdateService.createObjectUpdateForOwner({ input, context });
    }),

  batchCreate: protectedProcedure
    .input(objectUpdateSchema.batchCreate)
    .handler(async ({ input, context }) => {
      return await objectUpdateService.batchCreateObjectUpdatesForOwner({ input, context });
    }),
  batchDelete: protectedProcedure
    .input(objectUpdateSchema.batchDelete)
    .handler(async ({ input, context }) => {
      return await objectUpdateService.batchDeleteObjectUpdatesForOwner({ input, context });
    }),
};
