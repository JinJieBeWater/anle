import { protectedProcedure, publicProcedure } from "../../index";
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

  gc: protectedProcedure.input(documentUpdateSchema.gc).handler(async ({ input }) => {
    return await documentUpdateService.gcDocumentUpdates(input);
  }),
};
