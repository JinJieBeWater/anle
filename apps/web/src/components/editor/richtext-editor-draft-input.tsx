import { useEditor as useTiptapEditor } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { Dropcursor, Gapcursor, Placeholder, TrailingNode } from "@tiptap/extensions";

import { Editor } from "@/components/editor/editor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_PLACEHOLDER } from "@/hooks/use-editor";
import type { ObjectTemplateConfig } from "@anle/db/schema/object-template";
import { buildRichtextUpdateFromHtml } from "@/lib/richtext";

type RichtextEditorDraftInputProps = {
  value: string;
  onChange: (value: string) => void;
  resetKey?: string;
  placeholder?: string;
};

export type RichtextDraft = {
  fieldKey: string;
  updateData: string;
};

export const buildRichtextDrafts = (
  fields: ObjectTemplateConfig["objects"][number]["metadata"],
  metadata: Record<string, unknown> | undefined,
): RichtextDraft[] =>
  (fields ?? []).reduce<RichtextDraft[]>((acc, field) => {
    if (field.type !== "richtext") return acc;
    const raw = metadata?.[field.key];
    if (typeof raw !== "string" || raw.trim().length === 0) return acc;
    const updateData = buildRichtextUpdateFromHtml(raw);
    if (!updateData) return acc;
    acc.push({ fieldKey: field.key, updateData });
    return acc;
  }, []);

export function RichtextEditorDraftInput({
  value,
  onChange,
  resetKey,
  placeholder,
}: RichtextEditorDraftInputProps) {
  const latestValueRef = useRef(value);
  const editor = useTiptapEditor(
    {
      textDirection: "auto",
      extensions: [
        Document,
        Text,
        Paragraph,
        Dropcursor,
        Gapcursor,
        HardBreak,
        TrailingNode,
        Placeholder.configure({
          placeholder: placeholder ?? DEFAULT_PLACEHOLDER,
        }),
      ],
      onUpdate: ({ editor: currentEditor }) => {
        const nextValue = currentEditor.isEmpty ? "" : currentEditor.getHTML();
        if (latestValueRef.current !== nextValue) {
          onChange(nextValue);
        }
      },
    },
    [],
  );

  useEffect(() => {
    latestValueRef.current = value;
    if (!editor) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value, resetKey]);

  return (
    <div className="border border-input bg-background/60 focus-within:ring-1 focus-within:ring-ring/50">
      {editor ? (
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
