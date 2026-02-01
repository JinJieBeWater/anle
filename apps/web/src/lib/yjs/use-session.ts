import { usePowerSync } from "@powersync/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { acquireYjsSession, getCachedYDoc, releaseYjsSession } from "./session";

export const useYjsSession = (documentId: string) => {
  const powerSync = usePowerSync();
  const [isLoaded, setIsLoaded] = useState(false);

  const ydoc = useMemo(() => getCachedYDoc(documentId), [documentId]);

  const handleLoaded = useCallback(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    setIsLoaded(false);
    acquireYjsSession(powerSync, documentId, handleLoaded);

    return () => {
      releaseYjsSession(documentId, handleLoaded);
    };
  }, [documentId, handleLoaded, powerSync]);

  return { ydoc, isLoaded };
};
