import type { AbstractPowerSyncDatabase } from "@powersync/web";
import * as Y from "yjs";

import { YjsProvider } from "./provider";

type LoadedCallback = () => void;

export type YjsTarget = {
  entityType: string;
  entityId: string;
};

type YjsSession = {
  ydoc: Y.Doc;
  provider?: YjsProvider;
  refs: number;
  loaded: boolean;
  pendingLoaded: Set<LoadedCallback>;
  cleanupTimer?: ReturnType<typeof setTimeout>;
};

const SESSION_CACHE = new Map<string, YjsSession>();
const CLEANUP_DELAY_MS = 60_000;

const getSessionKey = (target: YjsTarget) => `${target.entityType}:${target.entityId}`;

const createSession = (): YjsSession => ({
  ydoc: new Y.Doc(),
  refs: 0,
  loaded: false,
  pendingLoaded: new Set(),
});

const getOrCreateSession = (target: YjsTarget): YjsSession => {
  const key = getSessionKey(target);
  let session = SESSION_CACHE.get(key);
  if (!session) {
    session = createSession();
    SESSION_CACHE.set(key, session);
  }
  return session;
};

const clearCleanupTimer = (session: YjsSession) => {
  if (!session.cleanupTimer) return;
  clearTimeout(session.cleanupTimer);
  session.cleanupTimer = undefined;
};

const runLoadedCallbacks = (session: YjsSession) => {
  session.loaded = true;
  for (const callback of session.pendingLoaded) {
    callback();
  }
  session.pendingLoaded.clear();
};

const ensureProvider = (session: YjsSession, db: AbstractPowerSyncDatabase, target: YjsTarget) => {
  if (session.provider?.db === db) return;
  session.provider?.destroy();
  session.loaded = false;
  session.provider = new YjsProvider(session.ydoc, db, {
    entityType: target.entityType,
    entityId: target.entityId,
    onLoaded: () => runLoadedCallbacks(session),
  });
};

export const getCachedYDoc = (target: YjsTarget): Y.Doc => getOrCreateSession(target).ydoc;

export const acquireYjsSession = (
  db: AbstractPowerSyncDatabase,
  target: YjsTarget,
  onLoaded?: LoadedCallback,
) => {
  const session = getOrCreateSession(target);
  ensureProvider(session, db, target);
  session.refs += 1;
  clearCleanupTimer(session);

  if (onLoaded) {
    if (session.loaded) {
      onLoaded();
    } else {
      session.pendingLoaded.add(onLoaded);
    }
  }

  return session;
};

export const releaseYjsSession = (target: YjsTarget, onLoaded?: LoadedCallback) => {
  const key = getSessionKey(target);
  const session = SESSION_CACHE.get(key);
  if (!session) return;

  if (onLoaded) {
    session.pendingLoaded.delete(onLoaded);
  }

  session.refs = Math.max(0, session.refs - 1);

  if (session.refs === 0) {
    session.cleanupTimer = setTimeout(() => {
      if (session.refs !== 0) return;
      session.provider?.destroy();
      session.ydoc.destroy();
      SESSION_CACHE.delete(key);
    }, CLEANUP_DELAY_MS);
  }
};

export const flushYjsSnapshot = async (target: YjsTarget, stateVector?: Uint8Array) => {
  const session = SESSION_CACHE.get(getSessionKey(target));
  if (!session?.provider) return;
  await session.provider.storeSnapshot(stateVector);
};

export const gcYjsUpdates = async (target: YjsTarget) => {
  const session = SESSION_CACHE.get(getSessionKey(target));
  if (!session?.provider) {
    return {
      success: `0 yjs_update rows compacted for ${target.entityType}=${target.entityId}`,
    };
  }
  return session.provider.gcLocalUpdates();
};

export const clearAllYjsSessions = () => {
  for (const [key, session] of SESSION_CACHE) {
    clearCleanupTimer(session);
    session.pendingLoaded.clear();
    session.refs = 0;
    session.loaded = false;
    session.provider?.destroy();
    session.ydoc.destroy();
    SESSION_CACHE.delete(key);
  }
};
