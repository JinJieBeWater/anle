import type { ReactNode } from "react";
import { createContext, Suspense, useContext, useEffect, useState } from "react";

import Loader from "@/components/loader";
import { Connector } from "@/lib/powersync/connector";
import { APP_SCHEMA, TodoDeserializationSchema, TodoSchema } from "@/lib/powersync/schema";
import { authClient } from "@/lib/auth-client";
import { PowerSyncContext } from "@powersync/react";
import {
  LogLevel,
  PowerSyncDatabase,
  WASQLiteOpenFactory,
  WASQLiteVFS,
  createBaseLogger,
} from "@powersync/web";
import { createCollection } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
import { useQuery } from "@tanstack/react-query";

const PowerSyncConnectorContext = createContext<Connector | null>(null);

export const useConnector = () => useContext(PowerSyncConnectorContext);

export const db = new PowerSyncDatabase({
  schema: APP_SCHEMA,
  database: new WASQLiteOpenFactory({
    dbFilename: "anle.db",
    vfs: WASQLiteVFS.OPFSCoopSyncVFS,
  }),
});

export const todoCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: APP_SCHEMA.props.todo,
    schema: TodoSchema,
    deserializationSchema: TodoDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(
        `Could not deserialize todo collection: ${error.issues.map((issue) => issue.message).join(", ")}`,
      );
    },
  }),
);

export const SystemProvider = ({ children }: { children: ReactNode }) => {
  const [connector] = useState(() => new Connector());
  const [powerSync] = useState(db);
  const { data: session, isPending } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => authClient.getSession(),
    select: (res) => res.data,
  });

  useEffect(() => {
    const logger = createBaseLogger();
    logger.useDefaults();
    logger.setLevel(LogLevel.DEBUG);
    (window as { _powersync?: PowerSyncDatabase })._powersync = powerSync;

    powerSync.init();
    connector.init();
  }, [connector, powerSync]);

  useEffect(() => {
    if (isPending) {
      return;
    }
    connector.updateSession(session || null);

    if (session) {
      powerSync.connect(connector);
    } else {
      powerSync.disconnect();
    }
  }, [connector, isPending, powerSync, session]);

  return (
    <Suspense fallback={<Loader />}>
      <PowerSyncContext.Provider value={powerSync}>
        <PowerSyncConnectorContext.Provider value={connector}>
          {children}
        </PowerSyncConnectorContext.Provider>
      </PowerSyncContext.Provider>
    </Suspense>
  );
};
