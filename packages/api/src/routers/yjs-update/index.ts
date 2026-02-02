import { publicProcedure } from "../../index";
import { yjsUpdateService } from "./service";
import { yjsUpdateSchema } from "./schema";

export const yjsUpdateRouter = {
  create: publicProcedure.input(yjsUpdateSchema.create).handler(async ({ input }) => {
    return await yjsUpdateService.createYjsUpdate(input);
  }),

  batchCreate: publicProcedure.input(yjsUpdateSchema.batchCreate).handler(async ({ input }) => {
    return await yjsUpdateService.batchCreateYjsUpdates(input);
  }),
  batchDelete: publicProcedure.input(yjsUpdateSchema.batchDelete).handler(async ({ input }) => {
    return await yjsUpdateService.batchDeleteYjsUpdates(input);
  }),
};
