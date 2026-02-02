import { UpdateType, type CrudEntry } from "@powersync/web";

import { shouldNeverHappen } from "@/utils/should-never-happen";
import { todoHandler } from "./todo";
import { documentHandler } from "./document";
import type { TableHandler, UploadContext } from "./types";
import { yjsUpdateHandler } from "./yjs-update";

const handlers = {
  todo: todoHandler,
  document: documentHandler,
  yjs_update: yjsUpdateHandler,
} satisfies Record<string, TableHandler<any, any>>;

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
  const handler = handlers[op.table as keyof typeof handlers] as TableHandler<any, any> | undefined;
  if (!handler) {
    shouldNeverHappen(`Unsupported table for upload: ${op.table}`, op);
    return;
  }
  await handleTableOp(op, context, handler);
};

export const buildUploadBatchers = () =>
  Object.values(handlers).flatMap((handler) => handler.buildBatchers?.() ?? []);
