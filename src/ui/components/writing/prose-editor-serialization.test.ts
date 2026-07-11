import { describe, it, expect, afterEach } from "vitest";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { textToDoc, docToText, selectionOffsets } from "./prose-editor-serialization";

let editor: Editor | null = null;

function makeEditor(text: string): Editor {
  editor = new Editor({ extensions: [StarterKit], content: textToDoc(text) });
  return editor;
}

afterEach(() => {
  editor?.destroy();
  editor = null;
});

describe("prose-editor-serialization", () => {
  it("round-trips single-line text", () => {
    expect(docToText(makeEditor("Ela sentiu medo."))).toBe("Ela sentiu medo.");
  });

  it("round-trips multi-line text including blank lines", () => {
    const text = "Linha um\nLinha dois\n\nLinha quatro";
    expect(docToText(makeEditor(text))).toBe(text);
  });

  it("round-trips empty text", () => {
    expect(docToText(makeEditor(""))).toBe("");
  });

  it("maps a selection to char offsets matching the plain-text slice", () => {
    const text = "Ela sentiu medo. O resto fica.";
    const ed = makeEditor(text);
    // PM position 1 = char offset 0 (start of first paragraph);
    // char offset 15 ("Ela sentiu medo") = PM position 16.
    ed.commands.setTextSelection({ from: 1, to: 16 });

    const { start, end } = selectionOffsets(ed);
    expect(start).toBe(0);
    expect(end).toBe(15);
    expect(text.slice(start, end)).toBe("Ela sentiu medo");
  });

  it("maps a selection that spans a line break to correct offsets", () => {
    const text = "abc\ndef";
    const ed = makeEditor(text);
    ed.commands.selectAll();
    const { start, end } = selectionOffsets(ed);
    expect(start).toBe(0);
    expect(end).toBe(text.length);
    expect(text.slice(start, end)).toBe(text);
  });
});
