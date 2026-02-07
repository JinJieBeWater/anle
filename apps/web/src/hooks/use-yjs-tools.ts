import { useCallback, useMemo } from "react";

import { buildYjsDocumentId, type YjsTarget } from "@/lib/yjs/session";
import { flushYjsSnapshot, gcYjsUpdates } from "../lib/yjs/session";

export const useYjsTools = (target: YjsTarget) => {
  const documentId = useMemo(() => buildYjsDocumentId(target), [target.objectId, target.fieldKey]);

  const flushSnapshot = useCallback(
    (stateVector?: Uint8Array) => flushYjsSnapshot(target, stateVector),
    [target],
  );

  const gcUpdates = useCallback(() => gcYjsUpdates(target), [target]);

  return {
    target,
    documentId,
    flushSnapshot,
    gcUpdates,
  };
};
