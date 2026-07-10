import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  AdvancedTechniquesPanel,
  MotifFormState,
  NarratorFormState,
} from "./AdvancedTechniquesPanel";

const DEFAULT_MOTIF: MotifFormState = {
  enabled: false,
  object: "",
  wound: "",
  curve: "linear",
  progress: 0,
};

const DEFAULT_NARRATOR: NarratorFormState = {
  enabled: false,
  highNeuroticism: false,
  dissonance: false,
  selfPerception: "",
};

function renderPanel(
  overrides: Partial<{ motif: MotifFormState; narrator: NarratorFormState }> = {},
) {
  const onMotifChange = vi.fn();
  const onNarratorChange = vi.fn();
  const utils = render(
    <AdvancedTechniquesPanel
      motif={overrides.motif ?? DEFAULT_MOTIF}
      onMotifChange={onMotifChange}
      narrator={overrides.narrator ?? DEFAULT_NARRATOR}
      onNarratorChange={onNarratorChange}
    />,
  );
  return { ...utils, onMotifChange, onNarratorChange };
}

describe("AdvancedTechniquesPanel", () => {
  it("inicia recolhido, escondendo os campos", () => {
    renderPanel();
    expect(screen.queryByLabelText("Símbolo")).not.toBeInTheDocument();
    expect(screen.queryByText("Motivo Simbólico")).not.toBeInTheDocument();
  });

  it("expande ao clicar no cabeçalho e mostra as seções", () => {
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: /Técnicas Avançadas/ }));
    expect(screen.getByText("Motivo Simbólico")).toBeInTheDocument();
    expect(screen.getByText("Narrador Não-Confiável")).toBeInTheDocument();
  });

  it("habilita o motivo e propaga a mudança", () => {
    const { onMotifChange } = renderPanel();
    fireEvent.click(screen.getByRole("button", { name: /Técnicas Avançadas/ }));
    fireEvent.click(screen.getByLabelText("Motivo Simbólico"));
    expect(onMotifChange).toHaveBeenCalledWith({ ...DEFAULT_MOTIF, enabled: true });
  });

  it("mostra os campos do motivo apenas quando habilitado", () => {
    renderPanel({ motif: { ...DEFAULT_MOTIF, enabled: true } });
    fireEvent.click(screen.getByRole("button", { name: /Técnicas Avançadas/ }));
    expect(screen.getByLabelText("Símbolo")).toBeInTheDocument();
    expect(screen.getByLabelText("Ferida associada")).toBeInTheDocument();
    expect(screen.getByLabelText(/Proximidade do confronto/)).toBeInTheDocument();
  });

  it("edita o símbolo do motivo e propaga a mudança", () => {
    const { onMotifChange } = renderPanel({ motif: { ...DEFAULT_MOTIF, enabled: true } });
    fireEvent.click(screen.getByRole("button", { name: /Técnicas Avançadas/ }));
    fireEvent.change(screen.getByLabelText("Símbolo"), {
      target: { value: "espelho quebrado" },
    });
    expect(onMotifChange).toHaveBeenCalledWith({
      ...DEFAULT_MOTIF,
      enabled: true,
      object: "espelho quebrado",
    });
  });

  it("habilita o narrador não-confiável e propaga a mudança", () => {
    const { onNarratorChange } = renderPanel();
    fireEvent.click(screen.getByRole("button", { name: /Técnicas Avançadas/ }));
    fireEvent.click(screen.getByLabelText("Narrador Não-Confiável"));
    expect(onNarratorChange).toHaveBeenCalledWith({ ...DEFAULT_NARRATOR, enabled: true });
  });

  it("mostra os campos do narrador apenas quando habilitado", () => {
    renderPanel({ narrator: { ...DEFAULT_NARRATOR, enabled: true } });
    fireEvent.click(screen.getByRole("button", { name: /Técnicas Avançadas/ }));
    expect(screen.getByLabelText("Alto neuroticismo")).toBeInTheDocument();
    expect(screen.getByLabelText("Dissonância")).toBeInTheDocument();
    expect(screen.getByLabelText("Autopercepção")).toBeInTheDocument();
  });
});
