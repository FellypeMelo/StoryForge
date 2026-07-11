import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProseEditor } from "./ProseEditor";

describe("ProseEditor", () => {
  it("renderiza uma superfície de edição acessível com o valor inicial", () => {
    render(
      <ProseEditor
        value="Texto inicial."
        onChange={vi.fn()}
        onSelectionChange={vi.fn()}
        placeholder="Comece a escrever..."
      />,
    );

    const editor = screen.getByRole("textbox", { name: "Editor de prosa" });
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveTextContent("Texto inicial.");
  });
});
