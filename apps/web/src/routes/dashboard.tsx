import { createFileRoute } from "@tanstack/react-router";
import { useAppSession } from "@/hooks/use-app-session";
import { useQuery } from "@powersync/react";
import { objectDeserializationSchema } from "@/lib/powersync/schema";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, userId, isAuthenticated, isLocalMode } = useAppSession();

  const { data: pendingLists, isLoading, isFetching, error } = useQuery("SELECT * FROM object");

  console.log({
    pendingLists,
    isLoading,
    isFetching,
    error,
    data: objectDeserializationSchema.array().parse(pendingLists),
  });

  return (
    <div className="mx-auto w-full max-w-3xl py-10 space-y-4">
      <h1>Dashboard</h1>
      <div className="space-y-1 text-sm">
        <div>
          <strong>User ID:</strong> {userId}
        </div>
        <div>
          <strong>Authenticated:</strong> {String(isAuthenticated)}
        </div>
        <div>
          <strong>Local Mode:</strong> {String(isLocalMode)}
        </div>
      </div>
      <div>
        <h2 className="text-sm font-semibold">Session</h2>
        <pre className="mt-2 rounded border bg-muted/30 p-3 text-xs">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}
