import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChaptersPage from "./ChaptersPage";
import { ToastProvider } from "../shared/Toast";
import { LocalStorageChapterRepository } from "../../../infrastructure/local/local-storage-chapter-repository";
import { ChapterOutlineRepository } from "../../../domain/ports/chapter-outline-repository";
import { BookId } from "../../../domain/value-objects/book-id";
import { ChapterId } from "../../../domain/value-objects/chapter-id";
import { ChapterOutline } from "../../../domain/chapter-outline";
import { SceneBeat, DisasterType } from "../../../domain/scene-beat";
import { SequelBeat } from "../../../domain/sequel-beat";
import { Cliffhanger, CliffhangerType } from "../../../domain/cliffhanger";
import { ScenePolarity } from "../../../domain/scene-grid";

const repo = new LocalStorageChapterRepository();

function buildChapterOne(
  start: "positive" | "negative" = "positive",
  end: "positive" | "negative" = "negative",
): ChapterOutline {
  return ChapterOutline.create(
    ChapterId.generate(),
    1,
    [
      SceneBeat.create("Encontrar o mapa", "A biblioteca está em chamas", DisasterType.YesBut()),
      SequelBeat.create(
        "Entra em pânico com a perda iminente",
        ["Arriscar a vida no fogo", "Perder o mapa para sempre"],
        "Decide entrar com roupas molhadas",
      ),
      SceneBeat.create(
        "Atravessar as estantes em chamas",
        "O teto desaba bloqueando a saída",
        DisasterType.NoAndWorse(),
      ),
    ],
    Cliffhanger.create(CliffhangerType.Climactic(), "Descobre que o mapa é falso"),
    ScenePolarity.create(start),
    ScenePolarity.create(end),
  );
}

function buildDisconnectedChapterTwo(): ChapterOutline {
  return ChapterOutline.create(
    ChapterId.generate(),
    2,
    [
      SceneBeat.create("Confrontar o traidor", "O aliado revela um plano oculto", DisasterType.No()),
      SequelBeat.create(
        "Sente fúria gelada diante da traição",
        ["Trair o grupo inteiro", "Sacrificar sua própria honra"],
        "Resolve fingir lealdade por enquanto",
      ),
      SceneBeat.create(
        "Perseguir o vilão pela ponte",
        "Um abismo separa ambos os lados",
        DisasterType.YesBut(),
      ),
    ],
    Cliffhanger.create(CliffhangerType.PrePoint(), "O vilão salta segurando o artefato"),
    ScenePolarity.create("negative"),
    ScenePolarity.create("positive"),
  );
}

function renderPage(bookId: string, repository?: ChapterOutlineRepository) {
  const onBack = vi.fn();
  const utils = render(
    <ToastProvider>
      <ChaptersPage bookId={bookId} onBack={onBack} repository={repository} />
    </ToastProvider>,
  );
  return { onBack, ...utils };
}

async function fillCreateForm() {
  const goals = screen.getAllByLabelText("Objetivo");
  const conflicts = screen.getAllByLabelText("Conflito");
  fireEvent.change(goals[0], { target: { value: "Roubar a chave do cofre" } });
  fireEvent.change(conflicts[0], { target: { value: "Os guardas dobram a vigília" } });
  fireEvent.change(goals[1], { target: { value: "Escapar pelos telhados" } });
  fireEvent.change(conflicts[1], { target: { value: "Uma tempestade derruba as telhas" } });
  fireEvent.change(screen.getByLabelText("Reação"), {
    target: { value: "Treme de medo diante do fracasso" },
  });
  fireEvent.change(screen.getByLabelText(/Dilema/), {
    target: { value: "Arriscar a queda fatal\nPerder a chave para sempre" },
  });
  fireEvent.change(screen.getByLabelText("Decisão"), {
    target: { value: "Decide pular mesmo assim" },
  });
  fireEvent.change(screen.getByLabelText(/Descrição do cliffhanger/i), {
    target: { value: "A chave escorrega da mão dela" },
  });
}

describe("ChaptersPage", () => {
  let bookId: string;

  beforeEach(() => {
    localStorage.clear();
    bookId = crypto.randomUUID();
  });

  it("mostra carregamento e depois estado vazio em pt-BR com borda tracejada", async () => {
    const { container } = renderPage(bookId);
    expect(screen.getByText(/Carregando capítulos/i)).toBeInTheDocument();

    expect(await screen.findByText("Nenhum capítulo planejado")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Planejar primeiro capítulo/i }),
    ).toBeInTheDocument();
    expect(container.querySelector(".border-dashed")).not.toBeNull();
  });

  it("chama onBack ao clicar em Voltar", async () => {
    const { onBack } = renderPage(bookId);
    fireEvent.click(await screen.findByRole("button", { name: /Voltar/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("lista capítulos persistidos e exibe os detalhes do primeiro", async () => {
    await repo.save(BookId.create(bookId), [buildChapterOne()]);
    renderPage(bookId);

    expect(await screen.findByRole("button", { name: "Cap. 1" })).toBeInTheDocument();
    expect(screen.getByText("Encontrar o mapa")).toBeInTheDocument();
    expect(screen.getByText("CLIFFHANGER")).toBeInTheDocument();
    expect(screen.getByText("Descobre que o mapa é falso")).toBeInTheDocument();
    expect(screen.getByText(/\+\s*→\s*-/)).toBeInTheDocument();
  });

  it("exibe aviso de polaridade quando a cena não inverte a valência", async () => {
    await repo.save(BookId.create(bookId), [buildChapterOne("positive", "positive")]);
    renderPage(bookId);

    expect(await screen.findByText(/Cena inútil/i)).toBeInTheDocument();
  });

  it("cria um novo capítulo e persiste no repositório", async () => {
    renderPage(bookId);
    fireEvent.click(
      await screen.findByRole("button", { name: /Planejar primeiro capítulo/i }),
    );

    await fillCreateForm();
    fireEvent.click(screen.getByRole("button", { name: /Salvar capítulo/i }));

    expect(await screen.findByRole("button", { name: "Cap. 1" })).toBeInTheDocument();
    expect(screen.getByText("Roubar a chave do cofre")).toBeInTheDocument();

    await waitFor(async () => {
      const saved = await repo.getByBookId(BookId.create(bookId));
      expect(saved).toHaveLength(1);
      expect((saved[0].getBeats()[0] as SceneBeat).goal).toBe("Roubar a chave do cofre");
    });
  });

  it("mostra erro de validação em pt-BR sem persistir capítulo inválido", async () => {
    renderPage(bookId);
    fireEvent.click(
      await screen.findByRole("button", { name: /Planejar primeiro capítulo/i }),
    );

    fireEvent.click(screen.getByRole("button", { name: /Salvar capítulo/i }));

    expect(await screen.findByText(/Preencha o objetivo/i)).toBeInTheDocument();
    expect(await repo.getByBookId(BookId.create(bookId))).toHaveLength(0);
  });

  it("edita um capítulo existente com o formulário pré-preenchido", async () => {
    await repo.save(BookId.create(bookId), [buildChapterOne()]);
    renderPage(bookId);

    fireEvent.click(await screen.findByRole("button", { name: /Editar capítulo/i }));

    const goalField = screen.getAllByLabelText("Objetivo")[0];
    expect(goalField).toHaveValue("Encontrar o mapa");

    fireEvent.change(goalField, { target: { value: "Encontrar o diário secreto" } });
    fireEvent.click(screen.getByRole("button", { name: /Salvar capítulo/i }));

    expect(await screen.findByText("Encontrar o diário secreto")).toBeInTheDocument();
    await waitFor(async () => {
      const saved = await repo.getByBookId(BookId.create(bookId));
      expect((saved[0].getBeats()[0] as SceneBeat).goal).toBe("Encontrar o diário secreto");
    });
  });

  it("exclui capítulo após confirmação no ConfirmDialog", async () => {
    await repo.save(BookId.create(bookId), [buildChapterOne()]);
    renderPage(bookId);

    fireEvent.click(await screen.findByRole("button", { name: /Excluir capítulo/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    expect(await screen.findByText("Nenhum capítulo planejado")).toBeInTheDocument();
    expect(await repo.getByBookId(BookId.create(bookId))).toHaveLength(0);
  });

  it("exibe análise estrutural com erro de episodicidade entre capítulos desconexos", async () => {
    await repo.save(BookId.create(bookId), [
      buildChapterOne(),
      buildDisconnectedChapterTwo(),
    ]);
    renderPage(bookId);

    expect(await screen.findByText(/Análise estrutural/i)).toBeInTheDocument();
    expect(screen.getByText(/sem conexão causal/i)).toBeInTheDocument();
  });

  it("exibe erro quando o carregamento falha", async () => {
    const failing: ChapterOutlineRepository = {
      getByBookId: vi.fn().mockRejectedValue(new Error("boom")),
      save: vi.fn(),
    };
    renderPage(bookId, failing);

    expect(
      await screen.findByText(/Não foi possível carregar os capítulos/i),
    ).toBeInTheDocument();
  });

  it("exibe erro para bookId inválido", async () => {
    renderPage("nao-uuid");
    expect(
      await screen.findByText(/Identificador de livro inválido/i),
    ).toBeInTheDocument();
  });

  it("não usa classes de paleta hardcoded (zinc/blue/amber/red)", async () => {
    await repo.save(BookId.create(bookId), [buildChapterOne()]);
    const { container } = renderPage(bookId);
    await screen.findByText("CLIFFHANGER");

    const html = container.innerHTML;
    expect(html).not.toMatch(/(?:bg|text|border)-(?:zinc|blue|green|yellow|amber|red|purple)-\d/);
  });
});
