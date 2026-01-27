import type { CrudEntry } from "@powersync/web";
import type { ZodType } from "zod";

export type TableHandler<Put, Patch> = {
  putSchema: ZodType<Put>;
  patchSchema: ZodType<Patch>;
  put: (op: CrudEntry, data: Put) => Promise<void>;
  patch: (op: CrudEntry, data: Patch) => Promise<void>;
  remove: (op: CrudEntry) => Promise<void>;
};
