import type { AbstractPowerSyncDatabase } from "@powersync/web";
import * as Y from "yjs";

import { YjsProvider } from "./provider";

type LoadedCallback = () => void;

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

const createSession = (): YjsSession => ({
  ydoc: new Y.Doc(),
  refs: 0,
  loaded: false,
  pendingLoaded: new Set(),
});

const getOrCreateSession = (documentId: string): YjsSession => {
  let session = SESSION_CACHE.get(documentId);
  if (!session) {
    session = createSession();
    SESSION_CACHE.set(documentId, session);
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

const ensureProvider = (session: YjsSession, db: AbstractPowerSyncDatabase, documentId: string) => {
  if (session.provider?.db === db) return;
  session.provider?.destroy();
  session.loaded = false;
  session.provider = new YjsProvider(session.ydoc, db, {
    documentId,
    onLoaded: () => runLoadedCallbacks(session),
  });
};

export const getCachedYDoc = (documentId: string): Y.Doc => getOrCreateSession(documentId).ydoc;

export const acquireYjsSession = (
  db: AbstractPowerSyncDatabase,
  documentId: string,
  onLoaded?: LoadedCallback,
) => {
  const session = getOrCreateSession(documentId);
  ensureProvider(session, db, documentId);
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

export const releaseYjsSession = (documentId: string, onLoaded?: LoadedCallback) => {
  const session = SESSION_CACHE.get(documentId);
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
      SESSION_CACHE.delete(documentId);
    }, CLEANUP_DELAY_MS);
  }
};

export const flushYjsSnapshot = async (documentId: string, stateVector?: Uint8Array) => {
  const session = SESSION_CACHE.get(documentId);
  if (!session?.provider) return;
  await session.provider.storeSnapshot(stateVector);
};

export const clearAllYjsSessions = () => {
  for (const [documentId, session] of SESSION_CACHE) {
    clearCleanupTimer(session);
    session.pendingLoaded.clear();
    session.refs = 0;
    session.loaded = false;
    session.provider?.destroy();
    session.ydoc.destroy();
    SESSION_CACHE.delete(documentId);
  }
};
