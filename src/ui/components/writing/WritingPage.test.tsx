import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
  within,
} from "@testing-library/react";
import { WritingPage } from "./WritingPage";
import { mockDb } from "../../../test/mock-db";
import type { LlmPort, LlmResponse } from "../../../domain/ideation/ports/llm-port";

const RSIP_JSON = JSON.stringify({
  draft: "Rascunho gerado.",
  critique: "Crítica gerada.",
  finalVersion: "Versão final gerada.",
});

function makeLlm(text = RSIP_JSON): LlmPort & { prompts: string[] } {
  const prompts: string[] = [];
  return {
    prompts,
    async complete(prompt: string): Promise<LlmResponse> {
      prompts.push(prompt);
      return { text };
    },
  };
}

interface RenderOverrides {
  llmPort: LlmPort;
  bookId: string;
  projectId: string;
  onBack: () => void;
}

const VALID_PROJECT_ID = "550e8400-e29b-41d4-a716-446655440000";

function renderPage(overrides: Partial<RenderOverrides> = {}) {
  const llmPort = overrides.llmPort ?? makeLlm();
  const onBack = overrides.onBack ?? vi.fn();
  const bookId = overrides.bookId ?? "book-1";
  const projectId = overrides.projectId ?? VALID_PROJECT_ID;
  const utils = render(
    <WritingPage
      llmPort={llmPort}
      bookId={bookId}
      projectId={projectId}
      onBack={onBack}
    />,
  );
  return { ...utils, llmPort, onBack };
}

function getEditor(): HTMLTextAreaElement {
  return screen.getByRole("textbox", {
    name: "Editor de prosa",
  }) as HTMLTextAreaElement;
}

function fillScene() {
  fireEvent.change(screen.getByLabelText("Beat da cena"), {
    target: { value: "Herói descobre a traição" },
  });
  fireEvent.change(screen.getByLabelText("Personagem POV"), {
    target: { value: "Aria" },
  });
}

describe("WritingPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("rascunho por livro", () => {
    it("salva o rascunho com chave específica do livro após debounce", () => {
      vi.useFakeTimers();
      renderPage({ bookId: "abc" });

      fireEvent.change(getEditor(), { target: { value: "Primeira linha." } });
      act(() => {
        vi.advanceTimersByTime(1100);
      });

      expect(localStorage.getItem("storyforge_draft_abc")).toBe(
        "Primeira linha.",
      );
      expect(localStorage.getItem("storyforge_draft_")).toBeNull();
    });

    it("carrega o rascunho salvo do livro ao montar", () => {
      localStorage.setItem("storyforge_draft_abc", "Texto salvo.");
      renderPage({ bookId: "abc" });
      expect(getEditor().value).toBe("Texto salvo.");
    });
  });

  describe("geração de prosa", () => {
    it("desabilita Gerar Prosa até preencher beat e personagem", () => {
      renderPage();
      const btn = screen.getByRole("button", { name: "Gerar Prosa" });
      expect(btn).toBeDisabled();

      fillScene();
      expect(btn).toBeEnabled();
    });

    it("gera prosa via GenerateProseUseCase e exibe o painel RSIP", async () => {
      const llm = makeLlm();
      renderPage({ llmPort: llm });
      fillScene();

      fireEvent.click(screen.getByRole("button", { name: "Gerar Prosa" }));

      const panel = await screen.findByRole("complementary", {
        name: "Saída RSIP",
      });
      expect(within(panel).getByText("Versão final gerada.")).toBeInTheDocument();
      expect(within(panel).getByText("Rascunho gerado.")).toBeInTheDocument();
      expect(within(panel).getByText("Crítica gerada.")).toBeInTheDocument();
      expect(getEditor().value).toBe("Versão final gerada.");
      // Prova que passou pelo caso de uso, não pelo prompt inline antigo.
      expect(llm.prompts[0]).toContain("professional literary novelist");
      expect(llm.prompts[0]).toContain("Herói descobre a traição");
      expect(llm.prompts[0]).toContain("Aria");
    });

    it("injeta contexto do Codex (RAG) no prompt quando há entidades correspondentes", async () => {
      mockDb.seed({
        characters: [
          { id: "c1", project_id: VALID_PROJECT_ID, name: "Herói Trágico" },
        ],
      });
      const llm = makeLlm();
      renderPage({ llmPort: llm });
      fillScene();

      fireEvent.click(screen.getByRole("button", { name: "Gerar Prosa" }));

      await screen.findByRole("complementary", { name: "Saída RSIP" });
      expect(llm.prompts[0]).toContain("STORY CONTEXT");
      expect(llm.prompts[0]).toContain("Herói Trágico");
    });

    it("mostra estado de carregamento durante a geração", async () => {
      let resolve!: (r: LlmResponse) => void;
      const llm: LlmPort = {
        complete: () => new Promise<LlmResponse>((res) => (resolve = res)),
      };
      renderPage({ llmPort: llm });
      fillScene();

      fireEvent.click(screen.getByRole("button", { name: "Gerar Prosa" }));
      // The RAG context lookup runs before the LLM call; flush it so complete() fires.
      await act(async () => {});
      expect(screen.getByRole("button", { name: "Gerando..." })).toBeDisabled();

      await act(async () => resolve({ text: RSIP_JSON }));
      expect(
        screen.getByRole("button", { name: "Gerar Prosa" }),
      ).toBeInTheDocument();
    });

    it("exibe erro inline em português quando o LLM falha", async () => {
      const llm: LlmPort = {
        complete: vi.fn().mockRejectedValue(new Error("offline")),
      };
      renderPage({ llmPort: llm });
      fillScene();

      fireEvent.click(screen.getByRole("button", { name: "Gerar Prosa" }));

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(/Falha ao gerar prosa/);
    });

    it("exibe erro inline quando a resposta do LLM é inválida", async () => {
      renderPage({ llmPort: makeLlm("isto não é JSON") });
      fillScene();

      fireEvent.click(screen.getByRole("button", { name: "Gerar Prosa" }));

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(/Falha ao gerar prosa/);
    });
  });

  describe("ações de reescrita", () => {
    it("não exibe ações com o editor vazio", () => {
      renderPage();
      expect(
        screen.queryByRole("button", { name: "Reescrever (EPRL)" }),
      ).not.toBeInTheDocument();
    });

    it("reescreve apenas o trecho selecionado", async () => {
      const llm = makeLlm("TRECHO NOVO");
      renderPage({ llmPort: llm });
      const editor = getEditor();

      fireEvent.change(editor, {
        target: { value: "Ela sentiu medo. O resto fica." },
      });
      editor.setSelectionRange(0, 16);
      fireEvent.select(editor);

      fireEvent.click(
        screen.getByRole("button", { name: "Reescrever (EPRL)" }),
      );

      await waitFor(() =>
        expect(getEditor().value).toBe("TRECHO NOVO O resto fica."),
      );
      expect(llm.prompts[0]).toContain("Reescreva");
      expect(llm.prompts[0]).toContain("Ela sentiu medo.");
      expect(llm.prompts[0]).not.toContain("O resto fica.");
    });

    it("expande o texto inteiro quando não há seleção", async () => {
      const llm = makeLlm("Texto expandido.");
      renderPage({ llmPort: llm });

      fireEvent.change(getEditor(), { target: { value: "Base curta." } });
      fireEvent.click(screen.getByRole("button", { name: "Expandir" }));

      await waitFor(() => expect(getEditor().value).toBe("Texto expandido."));
      expect(llm.prompts[0]).toContain("Expanda");
      expect(llm.prompts[0]).toContain("Base curta.");
    });

    it("desabilita as ações e mostra progresso durante a reescrita", async () => {
      let resolve!: (r: LlmResponse) => void;
      const llm: LlmPort = {
        complete: () => new Promise<LlmResponse>((res) => (resolve = res)),
      };
      renderPage({ llmPort: llm });

      fireEvent.change(getEditor(), { target: { value: "Algum texto." } });
      fireEvent.click(
        screen.getByRole("button", { name: "Reescrever (EPRL)" }),
      );

      expect(
        screen.getByRole("button", { name: "Reescrevendo..." }),
      ).toBeDisabled();
      expect(screen.getByRole("button", { name: "Expandir" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Refinar" })).toBeDisabled();

      await act(async () => resolve({ text: "Novo." }));
      expect(getEditor().value).toBe("Novo.");
    });

    it("mostra erro inline quando a ação falha e preserva o texto", async () => {
      const llm: LlmPort = {
        complete: vi.fn().mockRejectedValue(new Error("x")),
      };
      renderPage({ llmPort: llm });

      fireEvent.change(getEditor(), { target: { value: "Algum texto." } });
      fireEvent.click(screen.getByRole("button", { name: "Refinar" }));

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(/Falha ao aplicar a ação/);
      expect(getEditor().value).toBe("Algum texto.");
    });
  });

  describe("painel lateral", () => {
    it("exibe estado vazio honesto no painel de beats", () => {
      renderPage();
      expect(screen.getByText("Nenhum beat definido")).toBeInTheDocument();
      expect(screen.getByText(/Estrutura/)).toBeInTheDocument();
      expect(screen.queryByText(/Hero discovers/)).not.toBeInTheDocument();
      expect(screen.queryByText(/SEQUELA/)).not.toBeInTheDocument();
    });

    it("exibe alertas de análise ao digitar um 'tell'", () => {
      renderPage();
      fireEvent.change(getEditor(), {
        target: { value: "Ela sentiu medo naquela hora." },
      });

      const sidebar = screen.getByRole("complementary", {
        name: "Painel da cena",
      });
      expect(within(sidebar).getByText("Alertas")).toBeInTheDocument();
      expect(within(sidebar).getByText("sentiu medo")).toBeInTheDocument();
    });
  });

  describe("sistema de design", () => {
    it("usa tokens do design system sem cores hardcoded", () => {
      const { container } = renderPage();
      fireEvent.change(getEditor(), { target: { value: "Ela sentiu medo." } });

      const root = container.firstElementChild as HTMLElement;
      expect(root.className).toContain("bg-bg-base");
      expect(container.innerHTML).not.toMatch(
        /(?:zinc|blue|purple|emerald|amber|red|green|yellow|orange|slate|gray|stone)-\d+/,
      );
    });
  });

  it("botão Voltar chama onBack", () => {
    const { onBack } = renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Voltar/ }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  describe("multi-perspectiva", () => {
    it("não exibe o botão Multi-Perspectiva com o editor vazio", () => {
      renderPage();
      expect(
        screen.queryByRole("button", { name: "Multi-Perspectiva" }),
      ).not.toBeInTheDocument();
    });

    it("gera variações estilísticas e insere a escolhida no editor", async () => {
      const mpsJson = JSON.stringify({
        cinico: "Versão cínica do trecho.",
        sensorial: "Versão sensorial do trecho.",
        poetico: "Versão poética do trecho.",
      });
      const llm = makeLlm(mpsJson);
      renderPage({ llmPort: llm });

      fireEvent.change(getEditor(), {
        target: { value: "Frase original de teste." },
      });
      fireEvent.click(screen.getByRole("button", { name: "Multi-Perspectiva" }));

      expect(await screen.findByText("Tom Cínico e Seco")).toBeInTheDocument();
      expect(screen.getByText("Versão cínica do trecho.")).toBeInTheDocument();
      expect(screen.getByText("Foco Sensorial")).toBeInTheDocument();
      expect(screen.getByText("Versão sensorial do trecho.")).toBeInTheDocument();
      expect(screen.getByText("Poético e Cadenciado")).toBeInTheDocument();
      expect(screen.getByText("Versão poética do trecho.")).toBeInTheDocument();

      fireEvent.click(screen.getAllByRole("button", { name: "Inserir" })[0]);
      expect(getEditor().value).toContain("Versão cínica do trecho.");
    });
  });

  describe("técnicas avançadas", () => {
    it("inclui o fragmento do Narrador Não-Confiável no prompt quando ativo", async () => {
      const llm = makeLlm();
      renderPage({ llmPort: llm });
      fillScene();

      fireEvent.click(screen.getByRole("button", { name: /Técnicas Avançadas/ }));
      fireEvent.click(screen.getByLabelText("Narrador Não-Confiável"));
      fireEvent.click(screen.getByLabelText("Alto neuroticismo"));
      fireEvent.click(screen.getByLabelText("Dissonância"));
      fireEvent.change(screen.getByLabelText("Autopercepção"), {
        target: { value: "Eu sou racional e calmo." },
      });

      fireEvent.click(screen.getByRole("button", { name: "Gerar Prosa" }));

      await screen.findByRole("complementary", { name: "Saída RSIP" });
      expect(llm.prompts[0]).toContain("divergir da AÇÃO");
    });

    it("inclui o fragmento de Motivo Simbólico no prompt quando habilitado com progresso alto", async () => {
      const llm = makeLlm();
      renderPage({ llmPort: llm });
      fillScene();

      fireEvent.click(screen.getByRole("button", { name: /Técnicas Avançadas/ }));
      fireEvent.click(screen.getByLabelText("Motivo Simbólico"));
      fireEvent.change(screen.getByLabelText("Símbolo"), {
        target: { value: "espelho quebrado" },
      });
      fireEvent.change(screen.getByLabelText("Ferida associada"), {
        target: { value: "medo de abandono" },
      });
      fireEvent.change(screen.getByLabelText(/Proximidade do confronto/), {
        target: { value: "0.9" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Gerar Prosa" }));

      await screen.findByRole("complementary", { name: "Saída RSIP" });
      expect(llm.prompts[0]).toContain("espelho quebrado");
    });

    it("não inclui fragmentos de técnicas avançadas quando ambas estão desativadas", async () => {
      const llm = makeLlm();
      renderPage({ llmPort: llm });
      fillScene();

      fireEvent.click(screen.getByRole("button", { name: "Gerar Prosa" }));

      await screen.findByRole("complementary", { name: "Saída RSIP" });
      expect(llm.prompts[0]).not.toContain("NARRADOR NÃO-CONFIÁVEL");
      expect(llm.prompts[0]).not.toContain("MOTIVO SIMBÓLICO");
    });
  });
});
