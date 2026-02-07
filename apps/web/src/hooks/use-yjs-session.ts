import { usePowerSync } from "@powersync/react";
import { useCallback, useEffect, useState } from "react";

import { useYjsTools } from "./use-yjs-tools";
import type { YjsTarget } from "@/lib/yjs/session";
import { acquireYjsSession, getCachedYDoc, releaseYjsSession } from "../lib/yjs/session";

export const useYjsSession = (target: YjsTarget) => {
  const powerSync = usePowerSync();
  const [isLoaded, setIsLoaded] = useState(false);
  const { documentId, flushSnapshot, gcUpdates } = useYjsTools(target);

  const ydoc = getCachedYDoc(target);

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

  return {
    ydoc,
    isLoaded,
    documentId,
    flushSnapshot,
    gcUpdates,
  };
};
