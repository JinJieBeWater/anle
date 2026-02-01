import type { CrudEntry } from "@powersync/web";
import type { ZodType } from "zod";

import type { AnleSession } from "../types";

export type UploadContext = {
  session: AnleSession;
};

export type UploadBatcher = {
  match: (op: CrudEntry) => boolean;
  add: (op: CrudEntry) => void;
  flush: (context: UploadContext) => Promise<void>;
};

export type TableHandler<Put, Patch> = {
  putSchema: ZodType<Put>;
  patchSchema: ZodType<Patch>;
  put: (op: CrudEntry, data: Put, context: UploadContext) => Promise<void>;
  patch: (op: CrudEntry, data: Patch, context: UploadContext) => Promise<void>;
  remove: (op: CrudEntry, context: UploadContext) => Promise<void>;
  buildBatchers?: () => UploadBatcher[];
};
