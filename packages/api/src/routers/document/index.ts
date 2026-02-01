import { publicProcedure } from "../../index";
import { documentService } from "./service";
import { documentSchema } from "./schema";

export const documentRouter = {
  create: publicProcedure.input(documentSchema.create).handler(async ({ input }) => {
    return await documentService.createDocument(input);
  }),

  updateTitle: publicProcedure.input(documentSchema.update).handler(async ({ input }) => {
    return await documentService.updateDocumentTitle(input);
  }),

  delete: publicProcedure.input(documentSchema.delete).handler(async ({ input }) => {
    return await documentService.deleteDocument(input);
  }),
};
