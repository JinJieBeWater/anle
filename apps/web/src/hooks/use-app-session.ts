import { useSession } from "@/components/providers/session-provider";

const LOCAL_OWNER_ID = "000000000000000000000";

export const useAppSession = () => {
  const sessionState = useSession();
  const session = sessionState.session;

  if (session) {
    return {
      ...sessionState,
      session,
      userId: session!.user.id,
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
