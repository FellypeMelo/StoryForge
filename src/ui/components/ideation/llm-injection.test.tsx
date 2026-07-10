import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ClicheExtractionStep } from "./ClicheExtractionStep";
import { PremiseGenerationStep } from "./PremiseGenerationStep";
import { ValidationStep } from "./ValidationStep";
import { IdeationState } from "./IdeationWizard";
import { LlmPort } from "../../../domain/ideation/ports/llm-port";

function makeState(overrides: Partial<IdeationState> = {}): IdeationState {
  return {
    genre: "Fantasia",
    cliches: [],
    discipline: "",
    premises: [],
    selectedPremiseIndex: null,
    validationResult: null,
    ...overrides,
  };
}

describe("Injeção de LlmPort nos passos de ideação", () => {
  it("ClicheExtractionStep usa o llmPort injetado", async () => {
    const llmPort: LlmPort = {
      complete: vi.fn().mockResolvedValue({ text: "Clichê A, Clichê B" }),
    };

    render(
      <ClicheExtractionStep
        state={makeState()}
        updateState={vi.fn()}
        onNext={vi.fn()}
        projectId="123e4567-e89b-12d3-a456-426614174000"
        llmPort={llmPort}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Mapear Clichês/i }));
    await waitFor(() => expect(llmPort.complete).toHaveBeenCalled());
  });

  it("ClicheExtractionStep mostra erro visível quando o LLM falha", async () => {
    const llmPort: LlmPort = {
      complete: vi.fn().mockRejectedValue(new Error("servidor fora do ar")),
    };

    render(
      <ClicheExtractionStep
        state={makeState()}
        updateState={vi.fn()}
        onNext={vi.fn()}
        projectId="123e4567-e89b-12d3-a456-426614174000"
        llmPort={llmPort}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Mapear Clichês/i }));
    expect(await screen.findByText(/Falha ao consultar a IA/i)).toBeInTheDocument();
  });

  it("PremiseGenerationStep usa o llmPort injetado", async () => {
    const llmPort: LlmPort = {
      complete: vi.fn().mockResolvedValue({ text: "[]" }),
    };

    render(
      <PremiseGenerationStep
        state={makeState({ discipline: "Botânica", cliches: ["O Escolhido", "Espada Mágica"] })}
        updateState={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        llmPort={llmPort}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Gerar 3 Premissas/i }));
    await waitFor(() => expect(llmPort.complete).toHaveBeenCalled());
  });

  it("ValidationStep usa o llmPort injetado", async () => {
    const llmPort: LlmPort = {
      complete: vi
        .fn()
        .mockResolvedValue({ text: JSON.stringify({ isValid: true, reason: "ok" }) }),
    };

    render(
      <ValidationStep
        state={makeState({
          premises: [
            {
              protagonist: "Uma botânica isolada numa estação orbital",
              incitingIncident: "Descobre que suas plantas imitam a voz da esposa falecida",
              antagonist: "A corporação que quer extrair o óleo da memória",
              stakes: "A sanidade do protagonista e a última conexão com a amada",
            },
          ],
          selectedPremiseIndex: 0,
        })}
        updateState={vi.fn()}
        onBack={vi.fn()}
        onFinish={vi.fn()}
        projectId="123e4567-e89b-12d3-a456-426614174000"
        bookId="123e4567-e89b-12d3-a456-426614174001"
        llmPort={llmPort}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Validar Potencial/i }));
    await waitFor(() => expect(llmPort.complete).toHaveBeenCalled());
  });
});
