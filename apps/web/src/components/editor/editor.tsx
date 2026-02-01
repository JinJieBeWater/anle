import "@/components/editor/styles.css";
import { Tiptap } from "@tiptap/react";
import type { Editor as TiptapEditor } from "@tiptap/core";

import { ScrollArea } from "@/components/ui/scroll-area";

export type EditorProps = {
  editor: TiptapEditor | null;
  className?: string;
};

export function Editor({ editor, className }: EditorProps) {
  return (
    <Tiptap instance={editor}>
      <ScrollArea className={className}>
        <Tiptap.Content />
      </ScrollArea>
    </Tiptap>
  );
}
