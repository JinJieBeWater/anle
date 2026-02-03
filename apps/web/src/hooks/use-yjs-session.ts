import { usePowerSync } from "@powersync/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useYjsTools } from "./use-yjs-tools";
import { acquireYjsSession, getCachedYDoc, releaseYjsSession } from "../lib/yjs/session";

export const useYjsSession = (objectId: string, ownerId: string) => {
  const powerSync = usePowerSync();
  const [isLoaded, setIsLoaded] = useState(false);
  const { target, documentId, flushSnapshot, gcUpdates } = useYjsTools(objectId, ownerId);

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

  return { ydoc, isLoaded, documentId, objectId, ownerId, flushSnapshot, gcUpdates };
};
