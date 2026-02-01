import type { ReactNode } from "react";

import { useStatus } from "@powersync/react";

import { cn } from "@/lib/utils";

type GuardByConnectionProps = {
  children: ReactNode;
  className?: string;
};

export const GuardByConnection = ({ children, className }: GuardByConnectionProps) => {
  const status = useStatus();
  const isConnecting = status.connecting;
  const disabled = !status.connected;

  return (
    <fieldset
      disabled={disabled}
      aria-disabled={disabled}
      aria-busy={isConnecting || undefined}
      data-sync-disabled={disabled ? "true" : "false"}
      data-sync-connecting={isConnecting ? "true" : "false"}
      className={cn("group m-0 min-w-0 border-0 p-0", className)}
    >
      {children}
    </fieldset>
  );
};
