import { useStatus } from "@powersync/react";

import { Badge } from "@/components/ui/badge";
import { useAppSession } from "@/hooks/use-app-session";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  className?: string;
};

export function SyncStatusBadge({ className }: StatusBadgeProps) {
  const status = useStatus();
  const isConnecting = status.connecting;
  const isConnected = status.connected;
  const syncLabel = isConnecting ? "Connecting" : isConnected ? "Connected" : "Offline";
  const syncDotClass = isConnecting
    ? "bg-amber-500/80"
    : isConnected
      ? "bg-emerald-500/80"
      : "bg-rose-500/80";

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-2 border-border/60 bg-muted/40 text-[11px] text-muted-foreground pointer-events-none",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", syncDotClass)} data-icon="inline-start" />
      {syncLabel}
    </Badge>
  );
}

export function AuthStatusBadge({ className }: StatusBadgeProps) {
  const { isAuthenticated } = useAppSession();
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-2 border-border/60 bg-muted/40 text-[11px] text-muted-foreground pointer-events-none",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" data-icon="inline-start" />
      {isAuthenticated ? "Signed in" : "Browsing as guest"}
    </Badge>
  );
}
