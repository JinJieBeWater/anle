import { UpdateType, type CrudEntry } from "@powersync/web";

import { shouldNeverHappen } from "@/utils/should-never-happen";
import { todoHandler } from "./todo";
import { normalizeTableName } from "./utils";

const handlers = {
  todo: todoHandler,
} as const;

type HandlerMap = typeof handlers;

export const handleCrudOp = async (op: CrudEntry) => {
  const table = normalizeTableName(op.table) as keyof HandlerMap;
  const handler = handlers[table];

  if (!handler) {
    shouldNeverHappen(`Unsupported table for upload: ${op.table}`, op);
  }

  switch (op.op) {
    case UpdateType.PUT: {
      const data = handler.putSchema.parse(op.opData);
      await handler.put(op, data);
      break;
    }
    case UpdateType.PATCH: {
      const data = handler.patchSchema.parse(op.opData);
      await handler.patch(op, data);
      break;
    }
    case UpdateType.DELETE: {
      await handler.remove(op);
      break;
    }
  }
};
