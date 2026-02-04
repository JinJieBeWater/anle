import { Link } from "@tanstack/react-router";
import { useLiveQuery } from "@tanstack/react-db";
import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";

import { GuardBySync } from "@/components/guard-by-sync";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { objectTemplateCollection } from "@/lib/collections";
import { useAppSession } from "@/hooks/use-app-session";
import { cn } from "@/lib/utils";
import { useStatus } from "@powersync/react";

const hashToHue = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 360;
  }
  return Math.abs(hash);
};

export function TemplatesHome() {
  const { isAuthenticated, session } = useAppSession();
  const { data: templates = [], isLoading } = useLiveQuery((q) =>
    q
      .from({ objectTemplate: objectTemplateCollection })
      .orderBy(({ objectTemplate }) => objectTemplate.created_at, "desc"),
  );

  return (
    <GuardBySync>
      <div className="container mx-auto min-h-[calc(100svh-var(--header-height))] px-4 py-8 space-y-7">
        <div className="text-center sm:mt-[10svh]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Home
          </div>
          <div className="mt-2 font-semibold text-2xl">
            {isAuthenticated ? `Welcome back, ${session.user.name}` : "Welcome, Guest"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Pick a template below or open a document to start writing.
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <AuthStatusBadge />
            <SyncStatusBadge />
          </div>
        </div>

        {isLoading ? (
          <div className="flex w-full flex-wrap justify-center gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="sm:w-60 w-[48%]">
                <Card className="relative bg-card text-card-foreground">
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-1.5 rounded-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-end">
                    <div className="h-5 w-10" />
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">No entries yet.</div>
        ) : (
          <div className="flex w-full flex-wrap justify-center gap-3 sm:gap-4">
            {templates.map((template) => {
              const hue = hashToHue(template.name);
              const templateStyle = {
                "--template-accent": `hsl(${hue} 70% 45%)`,
              } as CSSProperties;

              return (
                <Link
                  key={template.id}
                  to="/t/$templateName"
                  params={{ templateName: template.name }}
                  className="sm:w-60 w-[48%]"
                >
                  <Card className="relative bg-card text-card-foreground" style={templateStyle}>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm font-semibold leading-tight">
                        <span className="size-1.5 rounded-full bg-(--template-accent)" />
                        {template.name}
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-end text-xs text-muted-foreground">
                      Open
                      <ArrowRight className="ml-1 size-3.5" />
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </GuardBySync>
  );
}

function SyncStatusBadge() {
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
      className="gap-2 border-border/60 bg-muted/40 text-[11px] text-muted-foreground"
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", syncDotClass)} data-icon="inline-start" />
      {syncLabel}
    </Badge>
  );
}

function AuthStatusBadge() {
  const { isAuthenticated } = useAppSession();
  return (
    <Badge
      variant="outline"
      className="gap-2 border-border/60 bg-muted/40 text-[11px] text-muted-foreground"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" data-icon="inline-start" />
      {isAuthenticated ? "Signed in" : "Browsing as guest"}
    </Badge>
  );
}
