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
import { objectTemplateCollection } from "@/lib/collections";
import { LOCAL_OWNER_ID, useAppSession } from "@/hooks/use-app-session";
import type { ObjectTemplateConfig } from "@anle/db/schema/object-template";
import { shouldNeverHappen } from "@/utils/should-never-happen";

const PowerSyncConnectorContext = createContext<Connector | null>(null);
const NOVEL_TEMPLATE_NAME = "novel";
const NOVEL_TEMPLATE_CONFIG: ObjectTemplateConfig = {
  objects: [
    {
      type: "novel",
      label: "Novel",
      page: "home",
      metadata: [
        { key: "penName", type: "string", defaultRef: "user.username" },
        {
          key: "status",
          type: "enum",
          default: "ongoing",
          options: { values: ["ongoing", "finished"] },
          hideOnCreate: true,
        },
      ],
      relations: [{ type: "parent", targetType: "volume" }],
    },
    {
      type: "series",
      label: "Series",
      page: "home",
      relations: [{ type: "parent", targetType: "novel" }],
    },
    {
      type: "volume",
      label: "Volume",
      metadata: [{ key: "outline", type: "richtext", optional: true }],
      relations: [{ type: "parent", targetType: "chapter" }],
    },
    {
      type: "chapter",
      label: "Chapter",
      metadata: [
        { key: "outline", type: "richtext", optional: true },
        { key: "content", type: "richtext", optional: true },
      ],
    },
  ],
};

const seedNovelTemplate = async (ownerId: string) => {
  const templateState = await objectTemplateCollection.stateWhenReady();

  for (const template of templateState.values()) {
    if (template.name === NOVEL_TEMPLATE_NAME) {
      const currentConfig = template.config ?? null;
      const nextConfig = NOVEL_TEMPLATE_CONFIG;
      if (!currentConfig || JSON.stringify(currentConfig) !== JSON.stringify(nextConfig)) {
        await objectTemplateCollection.update(template.id, (draft) => {
          draft.config = nextConfig;
          draft.updated_at = new Date();
        }).isPersisted.promise;
      }
      return;
    }
  }

  await objectTemplateCollection.insert({
    id: crypto.randomUUID(),
    owner_id: ownerId,
    name: NOVEL_TEMPLATE_NAME,
    config: NOVEL_TEMPLATE_CONFIG,
    created_at: new Date(),
    updated_at: new Date(),
  }).isPersisted.promise;
};

export const useConnector = () => {
  const context = useContext(PowerSyncConnectorContext);
  if (!context) {
    throw shouldNeverHappen("useConnector must be used within SystemProvider");
  }
  return context;
};

const SystemProviderInner = ({ children }: { children: ReactNode }) => {
  const { session, isSuccess } = useSession();
  const { userId } = useAppSession();

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
    seedNovelTemplate(userId);
    const l = connector.registerListener({
      initialized: () => {},
      sessionStarted: async (activeSession) => {
        let isSyncMode = getSyncEnabled(DB_FILENAME);

        // Switch to sync mode if the user is logged in for first time
        if (!isSyncMode) {
          await switchToSyncedSchema(db, activeSession.user.id);
        }
        db.connect(connector);
      },
    });

    connector.init();

    return () => l?.();
  }, []);

  useEffect(() => {
    if (!isSuccess || session) {
      return;
    }

    void seedNovelTemplate(LOCAL_OWNER_ID);
  }, [isSuccess, session]);

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
