import type { ReactNode } from "react";
import { createContext, Suspense, useContext, useEffect } from "react";

import Loader from "@/components/loader";
import { connector, Connector } from "@/lib/powersync/connector";
import { switchToSyncedSchema } from "@/lib/powersync/utils";
import { SessionProvider, useSession } from "@/components/providers/session-provider";
import { PowerSyncContext } from "@powersync/react";
import { LogLevel, PowerSyncDatabase, createBaseLogger } from "@powersync/web";
import { db, DB_FILENAME } from "@/lib/powersync/db";
import { getSyncEnabled } from "@/lib/powersync/sync-mode";

const PowerSyncConnectorContext = createContext<Connector | null>(null);

export const useConnector = () => {
  const context = useContext(PowerSyncConnectorContext);
  if (!context) {
    throw new Error("useConnector must be used within SystemProvider");
  }
  return context;
};

const SystemProviderInner = ({ children }: { children: ReactNode }) => {
  const { session, isSuccess } = useSession();

  useEffect(() => {
    if (isSuccess) {
      connector.updateSession(session);
    }
  }, [isSuccess, session]);

  useEffect(() => {
    const logger = createBaseLogger();
    logger.useDefaults();
    logger.setLevel(LogLevel.DEBUG);
    (window as { _powersync?: PowerSyncDatabase })._powersync = db;

    db.init();

    const l = connector.registerListener({
      initialized: () => {},
      sessionStarted: async () => {
        let isSyncMode = getSyncEnabled(DB_FILENAME);

        // Switch to sync mode if the user is logged in for first time
        if (!isSyncMode) {
          await switchToSyncedSchema(db, connector.currentSession?.user.id!);
        }
        db.connect(connector);
      },
    });

    connector.init();

    return () => l?.();
  }, []);

  return (
    <Suspense fallback={<Loader />}>
      <PowerSyncContext.Provider value={db}>
        <PowerSyncConnectorContext.Provider value={connector}>
          {children}
        </PowerSyncConnectorContext.Provider>
      </PowerSyncContext.Provider>
    </Suspense>
  );
};

export const SystemProvider = ({ children }: { children: ReactNode }) => (
  <SessionProvider>
    <SystemProviderInner>{children}</SystemProviderInner>
  </SessionProvider>
);
