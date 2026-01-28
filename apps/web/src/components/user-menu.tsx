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
import { switchToLocalSchema } from "@/lib/powersync/switcher";
import { queryClient, SessionQueryKey } from "@/utils/orpc";

export default function UserMenu() {
  const navigate = useNavigate();
  const { session } = useSession();
  const connector = useConnector();
  const powerSync = usePowerSync();

  const handleSignOut = useCallback(async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          navigate({
            to: "/",
            replace: true,
          });
          connector?.removeSession();
          setSyncEnabled(powerSync.database.name, false);
          await queryClient.invalidateQueries({
            queryKey: SessionQueryKey,
          });
          await powerSync.disconnectAndClear();
          await switchToLocalSchema(powerSync);
        },
      },
    });
  }, [connector, navigate]);

  if (!session) {
    return (
      <Link to="/login">
        <Button variant="outline">Sign In</Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
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
