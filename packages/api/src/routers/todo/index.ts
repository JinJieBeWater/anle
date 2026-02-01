import { publicProcedure } from "../../index";
import { todoService } from "./service";
import { todoSchema } from "./schema";

export const todoRouter = {
  getAll: publicProcedure.handler(async () => {
    return await todoService.getTodos();
  }),

  create: publicProcedure.input(todoSchema.create).handler(async ({ input }) => {
    return await todoService.createTodo(input);
  }),

  toggle: publicProcedure.input(todoSchema.toggle).handler(async ({ input }) => {
    return await todoService.toggleTodo(input);
  }),

  delete: publicProcedure.input(todoSchema.delete).handler(async ({ input }) => {
    return await todoService.deleteTodo(input);
  }),
};
