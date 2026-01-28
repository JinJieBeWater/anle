import type { ColumnsType, CrudEntry, TableV2Options } from "@powersync/web";
import type { Session, User } from "better-auth";
import type { ZodType } from "zod";

export type AnleSession = {
  user: User;
  session: Session;
};

export type UploadContext = {
  session: AnleSession;
};

export type TableHandler<Put, Patch> = {
  putSchema: ZodType<Put>;
  patchSchema: ZodType<Patch>;
  put: (op: CrudEntry, data: Put, context: UploadContext) => Promise<void>;
  patch: (op: CrudEntry, data: Patch, context: UploadContext) => Promise<void>;
  remove: (op: CrudEntry, context: UploadContext) => Promise<void>;
};

export type TableDefinition<Columns = ColumnsType> = {
  name: string;
  columns: Columns;
  options?: TableV2Options;
};
