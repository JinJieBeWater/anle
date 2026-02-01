import { UpdateType, type CrudEntry } from "@powersync/web";

import { shouldNeverHappen } from "@/utils/should-never-happen";
import { todoHandler } from "./todo";
import { documentHandler } from "./document";
import type { TableHandler, UploadContext } from "../types";
import { documentUpdateHandler } from "./document-update";

const handleTableOp = async <TPut, TPatch>(
  op: CrudEntry,
  context: UploadContext,
  handler: TableHandler<TPut, TPatch>,
) => {
  switch (op.op) {
    case UpdateType.PUT: {
      const data = handler.putSchema.parse(op.opData);
      await handler.put(op, data, context);
      return;
    }
    case UpdateType.PATCH: {
      const data = handler.patchSchema.parse(op.opData);
      await handler.patch(op, data, context);
      return;
    }
    case UpdateType.DELETE: {
      await handler.remove(op, context);
      return;
    }
  }
};

export const handleCrudOp = async (op: CrudEntry, context: UploadContext) => {
  switch (op.table) {
    case "todo":
      await handleTableOp(op, context, todoHandler);
      return;
    case "document":
      await handleTableOp(op, context, documentHandler);
      return;
    case "document_update":
      await handleTableOp(op, context, documentUpdateHandler);
      return;
    default:
      shouldNeverHappen(`Unsupported table for upload: ${op.table}`, op);
  }
};
