import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MultiPerspectivePanel } from "./MultiPerspectivePanel";
import type { LlmPort, LlmResponse } from "../../../domain/ideation/ports/llm-port";

const VARIATIONS_JSON = JSON.stringify({
  cinico: "Texto cínico.",
  sensorial: "Texto sensorial.",
  poetico: "Texto poético.",
});

function makeLlm(text = VARIATIONS_JSON): LlmPort {
  return { complete: vi.fn().mockResolvedValue({ text } as LlmResponse) };
}

describe("MultiPerspectivePanel", () => {
  it("gera e exibe as 3 variações estilísticas ao clicar", async () => {
    const llmPort = makeLlm();
    render(
      <MultiPerspectivePanel
        llmPort={llmPort}
        getExcerpt={() => "Trecho."}
        onInsert={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Multi-Perspectiva" }));

    expect(
      screen.getByRole("button", { name: "Gerando variações..." }),
    ).toBeDisabled();

    await screen.findByText("Tom Cínico e Seco");
    expect(screen.getByText("Texto cínico.")).toBeInTheDocument();
    expect(screen.getByText("Foco Sensorial")).toBeInTheDocument();
    expect(screen.getByText("Texto sensorial.")).toBeInTheDocument();
    expect(screen.getByText("Poético e Cadenciado")).toBeInTheDocument();
    expect(screen.getByText("Texto poético.")).toBeInTheDocument();
  });

  it("insere a variação escolhida via onInsert", async () => {
    const onInsert = vi.fn();
    render(
      <MultiPerspectivePanel
        llmPort={makeLlm()}
        getExcerpt={() => "Trecho."}
        onInsert={onInsert}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Multi-Perspectiva" }));
    await screen.findByText("Tom Cínico e Seco");

    fireEvent.click(screen.getAllByRole("button", { name: "Inserir" })[0]);
    expect(onInsert).toHaveBeenCalledWith("Texto cínico.");
  });

  it("exibe erro em português quando o LLM falha", async () => {
    const llmPort: LlmPort = {
      complete: vi.fn().mockRejectedValue(new Error("offline")),
    };
    render(
      <MultiPerspectivePanel
        llmPort={llmPort}
        getExcerpt={() => "Trecho."}
        onInsert={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Multi-Perspectiva" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Falha ao gerar variações/);
  });
});
