import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useLocalStorage } from "@/hooks/use-local-storage";
import type { AnleSession } from "@/lib/powersync/types";
import { GetSessionQueryOptions } from "@/utils/orpc";

const SESSION_STORAGE_KEY = "auth.session";

type SessionContextValue = {
  session: AnleSession | null;
  isPending: boolean;
  isSuccess: boolean;
  removeSession: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [cachedSession, setCachedSession] = useLocalStorage<AnleSession | null>(
    SESSION_STORAGE_KEY,
    null,
  );
  const { data, isPending, isSuccess } = useQuery(GetSessionQueryOptions);

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    setCachedSession(data);
  }, [data, isSuccess, setCachedSession]);

  const removeSession = useCallback(() => {
    setCachedSession(null);
  }, [setCachedSession]);

  const value = useMemo(
    () => ({ session: cachedSession, isPending, isSuccess, removeSession }),
    [cachedSession, isPending, isSuccess],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
};
