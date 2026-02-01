import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import * as Y from "yjs";

import { flushYjsSnapshot } from "@/lib/yjs/session";

const composingDocuments = new Set<string>();
const compositionStateVectors = new Map<string, Uint8Array>();
const compositionContentHashes = new Map<string, number>();

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const getDocHash = (view: EditorView) => hashString(JSON.stringify(view.state.doc.toJSON()));

const startComposition = (
  documentId: string,
  stateVector: Uint8Array | undefined,
  contentHash: number,
) => {
  composingDocuments.add(documentId);
  if (stateVector) {
    compositionStateVectors.set(documentId, stateVector);
  }
  compositionContentHashes.set(documentId, contentHash);
};

const endComposition = (documentId: string) => {
  composingDocuments.delete(documentId);
  const stateVector = compositionStateVectors.get(documentId);
  const contentHash = compositionContentHashes.get(documentId);
  compositionStateVectors.delete(documentId);
  compositionContentHashes.delete(documentId);
  return { stateVector, contentHash };
};

export const isComposing = (documentId: string) => composingDocuments.has(documentId);

export type ImeUpdateOptimizerOptions = {
  documentId: string;
  document: Y.Doc;
};

export const ImeUpdateOptimizer = Extension.create<ImeUpdateOptimizerOptions>({
  name: "imeUpdateOptimizer",

  addProseMirrorPlugins() {
    const { documentId, document } = this.options;

    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            compositionstart: (view: EditorView) => {
              const stateVector = Y.encodeStateVector(document);
              startComposition(documentId, stateVector, getDocHash(view));
              return false;
            },
            compositionend: (view: EditorView) => {
              const { stateVector, contentHash } = endComposition(documentId);
              if (!stateVector) return false;
              if (contentHash !== undefined && contentHash === getDocHash(view)) {
                return false;
              }
              void flushYjsSnapshot(documentId, stateVector);
              return false;
            },
          },
        },
      }),
    ];
  },
});
