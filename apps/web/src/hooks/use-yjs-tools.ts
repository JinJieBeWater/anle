import { useCallback, useMemo } from "react";

import type { YjsTarget } from "@/lib/yjs/session";
import { flushYjsSnapshot, gcYjsUpdates } from "../lib/yjs/session";

export const useYjsTools = (objectId: string, ownerId: string) => {
  const target = useMemo<YjsTarget>(() => ({ objectId, ownerId }), [objectId, ownerId]);
  const documentId = useMemo(() => objectId, [objectId]);

  const flushSnapshot = useCallback(
    (stateVector?: Uint8Array) => flushYjsSnapshot(target, stateVector),
    [target],
  );

  const gcUpdates = useCallback(() => gcYjsUpdates(target), [target]);

  return { target, documentId, objectId, ownerId, flushSnapshot, gcUpdates };
};
