import { useEditor as useTiptapEditor, useEditorState } from "@tiptap/react";
import Collaboration from "@tiptap/extension-collaboration";
import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import {
  CharacterCount,
  Dropcursor,
  Gapcursor,
  Placeholder,
  TrailingNode,
} from "@tiptap/extensions";

import { useYjsSession } from "@/hooks/use-yjs-session";
import { ImeUpdateOptimizer } from "@/components/editor/extensions/ime-update-optimizer";
import { useAppSession } from "@/hooks/use-app-session";

export const DEFAULT_CHARACTER_LIMIT = 30_000;
export const DEFAULT_PLACEHOLDER = "Start writing your note...";

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;

  const cjkRegex = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;
  const cjkMatches = trimmed.match(cjkRegex) ?? [];
  const withoutCjk = trimmed.replace(cjkRegex, " ");
  const latinMatches = withoutCjk.match(/\b[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)?\b/gu) ?? [];

  return cjkMatches.length + latinMatches.length;
}

export type EditorOptions = {
  characterLimit?: number;
  placeholder?: string;
};

export function useEditor(documentId: string, options: EditorOptions = {}) {
  const { userId } = useAppSession();
  const session = useYjsSession(documentId, userId);
  const { ydoc, flushSnapshot, gcUpdates } = session;
  const characterLimit = options.characterLimit ?? DEFAULT_CHARACTER_LIMIT;
  const placeholder = options.placeholder ?? DEFAULT_PLACEHOLDER;

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
        CharacterCount.configure({
          limit: characterLimit,
        }),
        Placeholder.configure({
          placeholder,
        }),
        ImeUpdateOptimizer.configure({
          documentId,
          document: ydoc,
          flushSnapshot,
        }),
        Collaboration.configure({
          document: ydoc,
        }),
      ],
    },
    [ydoc],
  );

  const { charactersCount, wordsCount } = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      charactersCount: currentEditor.storage.characterCount.characters(),
      wordsCount: countWords(currentEditor?.getText() ?? ""),
    }),
  });

  const percentage = characterLimit > 0 ? Math.round((100 / characterLimit) * charactersCount) : 0;

  const isLimitReached = characterLimit > 0 ? charactersCount >= characterLimit : false;

  return {
    ...session,
    editor,
    charactersCount,
    wordsCount,
    characterLimit,
    percentage,
    isLimitReached,
    gcUpdates,
  };
}
