import type { ColumnsType, TableV2Options } from "@powersync/web";
import type { Session, User } from "better-auth";

export type AnleSession = {
  user: User;
  session: Session;
};

export type TableDefinition<Columns = ColumnsType> = {
  name: string;
  columns: Columns;
  options?: TableV2Options;
};
