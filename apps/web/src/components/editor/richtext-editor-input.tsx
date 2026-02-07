import { Editor } from "@/components/editor/editor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useEditor } from "@/hooks/use-editor";

type RichtextEditorInputProps = {
  objectId: string;
  fieldKey: string;
};

export function RichtextEditorInput({ objectId, fieldKey }: RichtextEditorInputProps) {
  const { isLoaded, editor } = useEditor({ objectId, fieldKey });

  return (
    <div className="border border-input bg-background/60 focus-within:ring-1 focus-within:ring-ring/50">
      {isLoaded ? (
        <Editor
          editor={editor}
          className="h-48 [&_.ProseMirror]:min-h-40 [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror]:text-sm [&_.ProseMirror]:leading-7 [&_.ProseMirror]:outline-none [&_.ProseMirror]:wrap-anywhere!"
        />
      ) : (
        <ScrollArea className="h-48">
          <div className="px-3 py-3 space-y-3 min-h-40">
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
