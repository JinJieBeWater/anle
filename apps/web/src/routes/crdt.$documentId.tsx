import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { documentCollection } from "@/lib/collections";
import { useLiveQuery, eq } from "@tanstack/react-db";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Editor } from "@/components/editor/editor";
import { useEditor } from "@/hooks/use-editor";

export const Route = createFileRoute("/crdt/$documentId")({
  component: RouteComponent,
  loader: async ({ params: { documentId } }) => {
    const state = await documentCollection.stateWhenReady();

    const document = state.get(documentId);
    if (!document) {
      console.log("insert");
      await documentCollection.insert({
        id: documentId,
        title: "Untitled document",
        created_at: new Date(),
      }).isPersisted.promise;
    }
  },
});

function RouteComponent() {
  const { documentId } = Route.useParams();

  const { data: document } = useLiveQuery(
    (q) =>
      q
        .from({ document: documentCollection })
        .where(({ document }) => eq(document.id, documentId))
        .findOne(),
    [documentId],
  );

  const {
    isLoaded,
    editor,
    charactersCount,
    wordsCount,
    characterLimit,
    percentage,
    isLimitReached,
  } = useEditor(documentId);

  const gcMutation = useMutation(orpc.documentUpdate.gc.mutationOptions());

  const handleGc = async (documentId: string) => {
    try {
      const result = await gcMutation.mutateAsync({
        document_id: documentId,
      });
      toast.success(result.success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "GC failed.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{document?.title ?? "CRDT Demo"}</CardTitle>
          <CardDescription>PowerSync + TipTap integration example.</CardDescription>
          <CardAction className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGc(documentId)}
              disabled={gcMutation.isPending}
            >
              {gcMutation.isPending ? "Compacting..." : "Compact (GC)"}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border border-input bg-background/60 focus-within:ring-1 focus-within:ring-ring/50">
            {isLoaded ? (
              <Editor
                editor={editor}
                className="h-[60vh] [&_.ProseMirror]:min-h-65 [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-3 [&_.ProseMirror]:text-sm [&_.ProseMirror]:leading-7 [&_.ProseMirror]:outline-none [&_.ProseMirror]:pb-80"
              />
            ) : (
              <ScrollArea className="h-[60vh]">
                <div className="px-4 py-5 space-y-3 min-h-65">
                  <Skeleton className="h-4 w-[85%]" />
                  <Skeleton className="h-4 w-[92%]" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[95%]" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[60%]" />
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <svg height="20" width="20" viewBox="0 0 20 20">
                <circle r="10" cx="10" cy="10" fill="var(--secondary)" />
                <circle
                  r="5"
                  cx="10"
                  cy="10"
                  fill="transparent"
                  stroke="var(--primary)"
                  strokeWidth="10"
                  strokeDasharray={`calc(${percentage} * 31.4 / 100) 31.4`}
                  transform="rotate(-90) translate(-20)"
                />
                <circle r="6" cx="10" cy="10" fill="var(--primary-foreground)" />
              </svg>

              <div className="leading-tight">
                <div
                  className={`font-medium ${
                    isLimitReached ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {charactersCount.toLocaleString()} / {characterLimit.toLocaleString()} characters
                </div>
                <div className={isLimitReached ? "text-destructive/80" : "text-muted-foreground"}>
                  {wordsCount.toLocaleString()} words
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
