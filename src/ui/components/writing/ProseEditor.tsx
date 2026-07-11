import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { docToText, selectionOffsets, textToDoc } from "./prose-editor-serialization";

interface ProseEditorProps {
  value: string;
  onChange: (text: string) => void;
  onSelectionChange: (start: number, end: number) => void;
  placeholder?: string;
  ariaLabel?: string;
}

const EDITOR_CLASS =
  "prose-editor w-full min-h-full p-4 bg-bg-surface border border-border-subtle rounded-lg font-serif text-sm leading-relaxed text-text-main focus:outline-none focus:border-border-default transition-colors";

/**
 * WYSIWYG prose surface backed by plain text. TipTap owns the rich rendering,
 * but the component's contract is a plain string (value/onChange) plus char-offset
 * selection reporting — identical to the previous textarea — so the surrounding
 * generate / rewrite / MPS / analysis / autosave flows are untouched.
 */
export function ProseEditor({
  value,
  onChange,
  onSelectionChange,
  placeholder,
  ariaLabel = "Editor de prosa",
}: ProseEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: placeholder ?? "" })],
    content: textToDoc(value),
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": ariaLabel,
        "aria-multiline": "true",
        class: EDITOR_CLASS,
      },
    },
    onUpdate: ({ editor }) => onChange(docToText(editor)),
    onSelectionUpdate: ({ editor }) => {
      const { start, end } = selectionOffsets(editor);
      onSelectionChange(start, end);
    },
  });

  // Reflect programmatic value changes (generate/rewrite/MPS set the string
  // externally). emitUpdate:false avoids a feedback loop back through onChange.
  useEffect(() => {
    if (!editor) return;
    if (docToText(editor) !== value) {
      editor.commands.setContent(textToDoc(value), { emitUpdate: false });
    }
  }, [editor, value]);

  return <EditorContent editor={editor} className="h-full overflow-y-auto" />;
}

export default ProseEditor;
