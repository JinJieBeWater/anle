import { usePowerSync, useStatus } from "@powersync/react";
import { ArrowDown, ArrowUp, Wifi, WifiOff } from "lucide-react";

import { useConnector } from "@/components/providers/system-provider";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function getFlowLabel(isUploading: boolean, isDownloading: boolean): string {
  if (isUploading && isDownloading) {
    return "Uploading and downloading";
  }
  if (isUploading) {
    return "Uploading";
  }
  if (isDownloading) {
    return "Downloading";
  }
  return "Idle";
}

export default function SyncStatusMenu() {
  const powerSync = usePowerSync();
  const connector = useConnector();
  const status = useStatus();

  const isConnected = status.connected;
  const isConnecting = status.connecting;
  const isUploading = Boolean(status.dataFlowStatus?.uploading);
  const isDownloading = Boolean(status.dataFlowStatus?.downloading);
  const isOnline = isConnected || isConnecting;
  const canConnect = Boolean(connector);
  const wifiTone = isOnline ? "" : "text-muted-foreground";
  const WifiIcon = isOnline ? Wifi : WifiOff;
  const flowLabel = getFlowLabel(isUploading, isDownloading);
  const handleConnect = () => {
    if (!connector) {
      return;
    }
    powerSync.connect(connector);
  };
  const handleDisconnect = () => {
    powerSync.disconnect();
  };

  return (
    <DropdownMenu>
      <ButtonGroup>
        <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
          <WifiIcon
            className={cn("size-4 transition-colors", wifiTone, isConnecting && "animate-pulse")}
          />
          <span className="sr-only">Sync connection status</span>
        </DropdownMenuTrigger>
        <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
          <span className="flex items-center transition-colors">
            <ArrowUp
              className={cn("translate-x-0.5 size-3.5", isUploading ? "" : "text-muted-foreground")}
            />
            <ArrowDown
              className={cn(
                "-translate-x-0.5 size-3.5",
                isDownloading ? "" : "text-muted-foreground",
              )}
            />
          </span>
          <span className="sr-only">{flowLabel}</span>
        </DropdownMenuTrigger>
      </ButtonGroup>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {isOnline ? (
            <DropdownMenuItem onClick={handleDisconnect}>Disconnect</DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled={!canConnect} onClick={handleConnect}>
              Connect
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
