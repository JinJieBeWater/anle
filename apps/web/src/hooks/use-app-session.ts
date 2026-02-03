import { SESSION_STORAGE_KEY, useSession } from "@/components/providers/session-provider";
import { localStorageValue } from "./use-local-storage";
import type { AnleSession } from "@/lib/powersync/types";

export const LOCAL_OWNER_ID = "000000000000000000000";

type AppSessionState = {
  session: AnleSession | null;
  userId: string;
  isAuthenticated: boolean;
  isLocalMode: boolean;
};

export const useAppSession = (): AppSessionState => {
  const sessionState = useSession();
  const session = sessionState.session;

  if (session) {
    return {
      ...sessionState,
      session,
      userId: session.user.id,
      isAuthenticated: true,
      isLocalMode: false,
    };
  }

  return {
    ...sessionState,
    session,
    userId: LOCAL_OWNER_ID,
    isAuthenticated: false,
    isLocalMode: true,
  };
};

export const getAppSession = (): AppSessionState => {
  const cachedSession = localStorageValue<AnleSession | null>(SESSION_STORAGE_KEY, null).get();
  if (cachedSession) {
    return {
      session: cachedSession,
      userId: cachedSession.user.id,
      isAuthenticated: true,
      isLocalMode: false,
    };
  }
  return {
    session: null,
    userId: LOCAL_OWNER_ID,
    isAuthenticated: false,
    isLocalMode: true,
  };
};
