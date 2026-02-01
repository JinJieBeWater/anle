import type { CrudEntry } from "@powersync/web";

import { shouldNeverHappen } from "@/utils/should-never-happen";
import type { TableHandler, UploadBatcher, UploadContext } from "./types";

export const createBatcher = <T>(options: {
  match: (op: CrudEntry) => boolean;
  collect: (op: CrudEntry) => T;
  flush: (items: T[], context: UploadContext) => Promise<void>;
}): UploadBatcher => {
  const items: T[] = [];
  return {
    match: options.match,
    add: (op) => {
      items.push(options.collect(op));
    },
    flush: async (context) => {
      if (items.length === 0) {
        return;
      }
      try {
        await options.flush(items, context);
        items.length = 0;
      } catch (error) {
        throw shouldNeverHappen(
          "Could not flush batcher",
          error instanceof Error ? error.message : error,
        );
      }
    },
  };
};

export const createHandler = <Put, Patch>(handler: TableHandler<Put, Patch>) => handler;
