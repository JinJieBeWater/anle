import type { ReactNode } from "react";

import { useStatus } from "@powersync/react";

import { Progress } from "@/components/ui/progress";

type GuardBySyncProps = {
  children: ReactNode;
  priority?: number;
};

export const GuardBySync = ({ children, priority }: GuardBySyncProps) => {
  const status = useStatus();
  if (!status.connected) {
    return children;
  }
  const hasSynced =
    priority == null ? status.hasSynced : status.statusForPriority(priority).hasSynced;

  if (hasSynced) {
    return children;
  }

  const allProgress = status.downloadProgress;
  const progress = priority == null ? allProgress : allProgress?.untilPriority(priority);
  const progressValue = progress
    ? Math.max(0, Math.min(100, progress.downloadedFraction * 100))
    : null;

  return (
    <div className="flex flex-col items-stretch gap-2 p-4">
      {progress ? (
        <>
          <Progress value={progressValue} />
          <div className="text-center text-xs text-muted-foreground">
            {progress.downloadedOperations === progress.totalOperations
              ? "Applying server-side changes"
              : `Downloaded ${progress.downloadedOperations} out of ${progress.totalOperations}.`}
          </div>
        </>
      ) : (
        <Progress value={null} />
      )}
    </div>
  );
};
