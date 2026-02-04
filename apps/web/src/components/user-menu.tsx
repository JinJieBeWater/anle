import { Link, useNavigate } from "@tanstack/react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { useSession } from "@/components/providers/session-provider";
import { useConnector } from "./providers/system-provider";
import { useCallback } from "react";
import { usePowerSync } from "@powersync/react";
import { setSyncEnabled } from "@/lib/powersync/sync-mode";
import { switchToLocalSchema } from "@/lib/powersync/utils";
import { queryClient, SessionQueryKey } from "@/utils/orpc";
import { clearAllYjsSessions } from "@/lib/yjs/session";

export default function UserMenu() {
  const navigate = useNavigate();
  const { session, removeSession } = useSession();
  const connector = useConnector();
  const powerSync = usePowerSync();

  const handleSignOut = useCallback(async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          connector?.removeSession();
          removeSession();
          setSyncEnabled(powerSync.database.name, false);
          await queryClient.invalidateQueries({
            queryKey: SessionQueryKey,
          });
          clearAllYjsSessions();
          await powerSync.disconnectAndClear();
          await switchToLocalSchema(powerSync);
          navigate({
            to: "/",
            replace: true,
          });
        },
      },
    });
  }, [connector, navigate, powerSync, removeSession]);

  if (!session) {
    return (
      <Link to="/login">
        <Button variant="outline">Sign In</Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" />}>
        {session.user.name}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{session.user.email}</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
