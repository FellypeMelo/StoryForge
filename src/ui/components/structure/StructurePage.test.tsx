import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StructurePage from "./StructurePage";
import { LocalStorageStructureRepository } from "../../../infrastructure/local/local-storage-structure-repository";
import { BookId } from "../../../domain/value-objects/book-id";
import { NarrativeFramework } from "../../../domain/narrative-framework";
import { StoryStructure } from "../../../domain/story-structure";
import { StoryStructureRepository } from "../../../domain/ports/story-structure-repository";

const repo = new LocalStorageStructureRepository();

function renderPage(bookId: string, overrides?: Partial<Parameters<typeof StructurePage>[0]>) {
  const onBack = vi.fn();
  const utils = render(<StructurePage bookId={bookId} onBack={onBack} {...overrides} />);
  return { onBack, ...utils };
}

describe("StructurePage", () => {
  let bookId: string;

  beforeEach(() => {
    localStorage.clear();
    bookId = crypto.randomUUID();
  });

  it("mostra estado de carregamento e depois os frameworks", async () => {
    renderPage(bookId);
    expect(screen.getByText(/Carregando estrutura/i)).toBeInTheDocument();

    expect(await screen.findByText("Jornada do Heroi")).toBeInTheDocument();
    expect(screen.getByText("Save the Cat")).toBeInTheDocument();
    expect(screen.getByText("Kishotenketsu")).toBeInTheDocument();
  });

  it("chama onBack ao clicar em Voltar", async () => {
    const { onBack } = renderPage(bookId);
    fireEvent.click(await screen.findByRole("button", { name: /Voltar/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("carrega a estrutura persistida ao montar", async () => {
    await repo.save(
      BookId.create(bookId),
      StoryStructure.create(NarrativeFramework.Kishotenketsu(), ["A vila desperta"]),
    );

    renderPage(bookId);

    const beatField = await screen.findByDisplayValue("A vila desperta");
    expect(beatField).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Kishotenketsu/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("persiste o beat ao sair do campo (blur)", async () => {
    renderPage(bookId);
    await screen.findByText("Jornada do Heroi");

    const firstBeat = screen.getAllByRole("textbox")[0];
    fireEvent.change(firstBeat, { target: { value: "Aldeia pacata no interior" } });
    fireEvent.blur(firstBeat);

    await waitFor(async () => {
      const saved = await repo.getByBookId(BookId.create(bookId));
      expect(saved?.getBeat(0)).toBe("Aldeia pacata no interior");
    });
  });

  it("exibe indicador de alterações não salvas e depois salvo", async () => {
    renderPage(bookId);
    await screen.findByText("Jornada do Heroi");

    const firstBeat = screen.getAllByRole("textbox")[0];
    fireEvent.change(firstBeat, { target: { value: "Mundo comum do herói" } });
    expect(screen.getByText(/Não salvo/i)).toBeInTheDocument();

    fireEvent.blur(firstBeat);
    expect(await screen.findByText(/^Salvo$/i)).toBeInTheDocument();
  });

  it("mostra progresso como fração em fonte mono, sem barra preenchida", async () => {
    renderPage(bookId);
    await screen.findByText("Jornada do Heroi");

    const fraction = screen.getByText("0/12");
    expect(fraction.className).toContain("font-mono");
  });

  it("troca de framework redefine os beats e persiste imediatamente", async () => {
    renderPage(bookId);
    await screen.findByText("Jornada do Heroi");

    fireEvent.click(screen.getByRole("button", { name: /Kishotenketsu/i }));

    expect(screen.getByText("0/4")).toBeInTheDocument();
    await waitFor(async () => {
      const saved = await repo.getByBookId(BookId.create(bookId));
      expect(saved?.frameworkName()).toBe("Kishotenketsu");
    });
  });

  it("exibe erro quando o carregamento falha", async () => {
    const failing: StoryStructureRepository = {
      getByBookId: vi.fn().mockRejectedValue(new Error("boom")),
      save: vi.fn(),
    };
    renderPage(bookId, { repository: failing });

    expect(
      await screen.findByText(/Não foi possível carregar a estrutura/i),
    ).toBeInTheDocument();
  });

  it("exibe erro para bookId inválido", async () => {
    renderPage("id-que-nao-e-uuid");
    expect(
      await screen.findByText(/Identificador de livro inválido/i),
    ).toBeInTheDocument();
  });

  it("não usa classes de paleta hardcoded (zinc/blue/green/yellow)", async () => {
    const { container } = renderPage(bookId);
    await screen.findByText("Jornada do Heroi");

    const html = container.innerHTML;
    expect(html).not.toMatch(/(?:bg|text|border)-(?:zinc|blue|green|yellow|amber|red|purple)-\d/);
  });
});
