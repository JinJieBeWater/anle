import { useCallback, useMemo } from "react";

import type { YjsTarget } from "@/lib/yjs/session";
import { flushYjsSnapshot, gcYjsUpdates } from "../lib/yjs/session";

export const useYjsTools = (entityId: string, entityType: string) => {
  const target = useMemo<YjsTarget>(() => ({ entityId, entityType }), [entityId, entityType]);
  const documentId = useMemo(() => entityId, [entityId]);

  const flushSnapshot = useCallback(
    (stateVector?: Uint8Array) => flushYjsSnapshot(target, stateVector),
    [target],
  );

  const gcUpdates = useCallback(() => gcYjsUpdates(target), [target]);

  return { target, documentId, entityType, entityId, flushSnapshot, gcUpdates };
};
