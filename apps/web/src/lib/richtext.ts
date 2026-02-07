import { Editor as TiptapEditor } from "@tiptap/core";
import Collaboration from "@tiptap/extension-collaboration";
import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { Dropcursor, Gapcursor, Placeholder, TrailingNode } from "@tiptap/extensions";
import * as Y from "yjs";

import { DEFAULT_PLACEHOLDER } from "@/hooks/use-editor";
import { Uint8ArrayTob64 } from "@/lib/yjs/binary";

const BASE_EXTENSIONS = [
  Document,
  Text,
  Paragraph,
  Dropcursor,
  Gapcursor,
  HardBreak,
  TrailingNode,
  Placeholder.configure({
    placeholder: DEFAULT_PLACEHOLDER,
  }),
];

export function buildRichtextUpdateFromHtml(html: string): string | null {
  const ydoc = new Y.Doc();
  const editor = new TiptapEditor({
    element: document.createElement("div"),
    extensions: [
      ...BASE_EXTENSIONS,
      Collaboration.configure({
        document: ydoc,
      }),
    ],
    content: html,
  });

  editor.commands.setContent(html || "", { emitUpdate: false });
  const isEmpty = editor.isEmpty;
  const update = isEmpty ? null : Uint8ArrayTob64(Y.encodeStateAsUpdateV2(ydoc));

  editor.destroy();
  ydoc.destroy();

  return update;
}
