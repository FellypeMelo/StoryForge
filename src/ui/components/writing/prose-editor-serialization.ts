import type { Editor, JSONContent } from "@tiptap/react";

// Blocks (paragraphs) serialize to plain text joined by a single newline, mirroring
// the previous <textarea> line semantics so char offsets stay identical across the swap.
const BLOCK_SEPARATOR = "\n";

/**
 * Plain text → ProseMirror doc: each line becomes a paragraph (an empty line
 * becomes an empty paragraph). This is the inverse of {@link docToText}, so a
 * round-trip preserves the exact string.
 */
export function textToDoc(text: string): JSONContent {
  const lines = text.split("\n");
  return {
    type: "doc",
    content: lines.map((line) => ({
      type: "paragraph",
      ...(line.length > 0 ? { content: [{ type: "text", text: line }] } : {}),
    })),
  };
}

/** ProseMirror doc → plain text, block boundaries joined by newline. */
export function docToText(editor: Editor): string {
  const { doc } = editor.state;
  return doc.textBetween(0, doc.content.size, BLOCK_SEPARATOR);
}

/**
 * Maps the editor's current selection to plain-text char offsets consistent
 * with {@link docToText}, so downstream slice/replace logic keeps working on
 * the string exactly as it did with the textarea's selectionStart/End.
 */
export function selectionOffsets(editor: Editor): { start: number; end: number } {
  const { doc, selection } = editor.state;
  return {
    start: doc.textBetween(0, selection.from, BLOCK_SEPARATOR).length,
    end: doc.textBetween(0, selection.to, BLOCK_SEPARATOR).length,
  };
}
