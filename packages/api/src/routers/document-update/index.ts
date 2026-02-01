import { publicProcedure } from "../../index";
import { documentUpdateService } from "./service";
import { documentUpdateSchema } from "./schema";

export const documentUpdateRouter = {
  create: publicProcedure.input(documentUpdateSchema.create).handler(async ({ input }) => {
    return await documentUpdateService.createDocumentUpdate(input);
  }),

  batchCreate: publicProcedure
    .input(documentUpdateSchema.batchCreate)
    .handler(async ({ input }) => {
      return await documentUpdateService.batchCreateDocumentUpdates(input);
    }),
  batchDelete: publicProcedure
    .input(documentUpdateSchema.batchDelete)
    .handler(async ({ input }) => {
      return await documentUpdateService.batchDeleteDocumentUpdates(input);
    }),
};
