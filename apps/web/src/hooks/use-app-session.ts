import { SESSION_STORAGE_KEY, useSession } from "@/components/providers/session-provider";
import { localStorageValue } from "./use-local-storage";
import type { AnleSession } from "@/lib/powersync/types";

export const LOCAL_OWNER_ID = "000000000000000000000";

export const useAppSession = () => {
  const sessionState = useSession();
  const session = sessionState.session;

  if (session) {
    return {
      ...sessionState,
      session,
      userId: session.user.id,
      isAuthenticated: true,
      isLocalMode: false,
    } as const;
  }

  return {
    ...sessionState,
    session,
    userId: LOCAL_OWNER_ID,
    isAuthenticated: false,
    isLocalMode: true,
  } as const;
};

export const getAppSession = () => {
  const cachedSession = localStorageValue<AnleSession | null>(SESSION_STORAGE_KEY, null).get();
  if (cachedSession) {
    return {
      session: cachedSession,
      userId: cachedSession.user.id,
      isAuthenticated: true,
      isLocalMode: false,
    } as const;
  }
  return {
    session: null,
    userId: LOCAL_OWNER_ID,
    isAuthenticated: false,
    isLocalMode: true,
  } as const;
};
