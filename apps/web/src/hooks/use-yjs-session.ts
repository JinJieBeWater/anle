import { usePowerSync } from "@powersync/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useYjsTools } from "./use-yjs-tools";
import { acquireYjsSession, getCachedYDoc, releaseYjsSession } from "../lib/yjs/session";

export const useYjsSession = (entityId: string, entityType: string) => {
  const powerSync = usePowerSync();
  const [isLoaded, setIsLoaded] = useState(false);
  const { target, documentId, flushSnapshot, gcUpdates } = useYjsTools(entityId, entityType);

  const ydoc = useMemo(() => getCachedYDoc(target), [target]);

  const handleLoaded = useCallback(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    setIsLoaded(false);
    acquireYjsSession(powerSync, target, handleLoaded);

    return () => {
      releaseYjsSession(target, handleLoaded);
    };
  }, [handleLoaded, powerSync, target]);

  return { ydoc, isLoaded, documentId, entityType, entityId, flushSnapshot, gcUpdates };
};
