import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BeatSheetGenerator } from "./BeatSheetGenerator";
import { NarrativeFramework } from "../../../domain/narrative-framework";

function renderGen(onGenerate = vi.fn().mockResolvedValue(true), onCancel = vi.fn()) {
  render(
    <BeatSheetGenerator chapterNumber={3} onGenerate={onGenerate} onCancel={onCancel} />,
  );
  return { onGenerate, onCancel };
}

describe("BeatSheetGenerator", () => {
  it("desabilita gerar até preencher protagonista e objetivo", () => {
    renderGen();
    const btn = screen.getByRole("button", { name: /Gerar beat sheet/i });
    expect(btn).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Protagonista"), {
      target: { value: "Nara" },
    });
    fireEvent.change(screen.getByLabelText("Objetivo do protagonista"), {
      target: { value: "Provar que a ilha existe" },
    });
    expect(btn).toBeEnabled();
  });

  it("chama onGenerate com o contexto preenchido e o framework selecionado", async () => {
    const onGenerate = vi.fn().mockResolvedValue(true);
    renderGen(onGenerate);

    fireEvent.change(screen.getByLabelText("Protagonista"), {
      target: { value: "  Nara  " },
    });
    fireEvent.change(screen.getByLabelText("Objetivo do protagonista"), {
      target: { value: "Encontrar o mapa" },
    });
    fireEvent.change(screen.getByLabelText("Resumo do capítulo anterior (opcional)"), {
      target: { value: "Chegou ao porto" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Gerar beat sheet/i }));

    await waitFor(() => expect(onGenerate).toHaveBeenCalledTimes(1));
    const arg = onGenerate.mock.calls[0][0];
    expect(arg.protagonistName).toBe("Nara");
    expect(arg.protagonistGoal).toBe("Encontrar o mapa");
    expect(arg.previousChapterSummary).toBe("Chegou ao porto");
    expect(arg.framework).toBeInstanceOf(NarrativeFramework);
  });

  it("mantém o formulário e reativa o botão quando a geração falha", async () => {
    const onGenerate = vi.fn().mockResolvedValue(false);
    renderGen(onGenerate);

    fireEvent.change(screen.getByLabelText("Protagonista"), {
      target: { value: "Nara" },
    });
    fireEvent.change(screen.getByLabelText("Objetivo do protagonista"), {
      target: { value: "Objetivo" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Gerar beat sheet/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Gerar beat sheet/i })).toBeEnabled(),
    );
  });

  it("cancelar chama onCancel", () => {
    const { onCancel } = renderGen();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
