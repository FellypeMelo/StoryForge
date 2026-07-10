import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AuditPanel from "./AuditPanel";
import { LocalStorageChapterRepository } from "../../../infrastructure/local/local-storage-chapter-repository";
import { ChapterOutlineRepository } from "../../../domain/ports/chapter-outline-repository";
import { BookId } from "../../../domain/value-objects/book-id";
import { scene, sequel, outline } from "../../../domain/audit/test-helpers";

const repo = new LocalStorageChapterRepository();

const AI_ISM_PROSE =
  "O silêncio ensurdecedor tomou conta da sala. Ela sentiu medo diante da escuridão.";

function seedDisconnectedChapters(bookId: string) {
  const chapter1 = outline(1, [
    scene("Encontra o anel amaldiçoado", "Guardião bloqueia passagem"),
    sequel("Frustração imensa", "Resolve esconder o anel amaldiçoado"),
    scene("Foge pelo túnel escuro", "Pedras desabam atrás dela"),
  ]);
  const chapter2 = outline(2, [
    scene("Prepara bolo delicioso", "Forno quebra inesperadamente"),
    sequel("Alegria contagiante", "Prefere comprar outro forno novo"),
    scene("Convida vizinhos festa", "Chuva atrapalha planos"),
  ]);
  return repo.save(BookId.create(bookId), [chapter1, chapter2]);
}

function renderPanel(bookId: string, repository?: ChapterOutlineRepository) {
  const onBack = vi.fn();
  const utils = render(
    <AuditPanel bookId={bookId} onBack={onBack} repository={repository} />,
  );
  return { onBack, ...utils };
}

describe("AuditPanel", () => {
  let bookId: string;

  beforeEach(() => {
    localStorage.clear();
    bookId = crypto.randomUUID();
  });

  it("renderiza título e chama onBack ao clicar em Voltar", async () => {
    const { onBack } = renderPanel(bookId);
    expect(await screen.findByText("Auditoria Bad Cop")).toBeInTheDocument();
    screen.getByRole("button", { name: /Voltar/i }).click();
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("exibe as 4 seções de eixo, o plano de ação e pelo menos um achado", async () => {
    await seedDisconnectedChapters(bookId);
    localStorage.setItem(`storyforge_draft_${bookId}`, AI_ISM_PROSE);

    renderPanel(bookId);

    expect(await screen.findByText("Plano de Ação")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Causação" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Agência" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Show-Don't-Tell" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Anti-Pattern" })).toBeInTheDocument();

    expect(screen.getAllByText(/sem conexão causal/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/sentiu medo/i).length).toBeGreaterThan(0);
  });

  it("mostra estado vazio honesto em cada eixo quando não há achados", async () => {
    renderPanel(bookId);
    expect(await screen.findAllByText(/Nenhum problema detectado neste eixo/i)).not.toHaveLength(
      0,
    );
  });

  it("roda os detectores heurísticos sobre o rascunho e lista os alertas", async () => {
    localStorage.setItem(`storyforge_draft_${bookId}`, AI_ISM_PROSE);
    renderPanel(bookId);

    expect(await screen.findByText("Detectores heurísticos (background)")).toBeInTheDocument();
    expect(screen.getAllByText(/silêncio ensurdecedor/i).length).toBeGreaterThan(0);
  });

  it("avisa honestamente quando não há rascunho para analisar", async () => {
    renderPanel(bookId);
    expect(
      await screen.findByText(/não há rascunho de prosa/i),
    ).toBeInTheDocument();
  });

  it("exibe erro para bookId inválido", async () => {
    renderPanel("nao-uuid");
    expect(
      await screen.findByText(/Identificador de livro inválido/i),
    ).toBeInTheDocument();
  });

  it("exibe erro quando o carregamento falha", async () => {
    const failing: ChapterOutlineRepository = {
      getByBookId: vi.fn().mockRejectedValue(new Error("boom")),
      save: vi.fn(),
    };
    renderPanel(bookId, failing);
    expect(
      await screen.findByText(/Não foi possível carregar os capítulos/i),
    ).toBeInTheDocument();
  });

  it("não usa classes de paleta hardcoded (zinc/blue/amber/red)", async () => {
    await seedDisconnectedChapters(bookId);
    localStorage.setItem(`storyforge_draft_${bookId}`, AI_ISM_PROSE);
    const { container } = renderPanel(bookId);
    await screen.findByText("Plano de Ação");

    const html = container.innerHTML;
    expect(html).not.toMatch(/(?:bg|text|border)-(?:zinc|blue|green|yellow|amber|red|purple)-\d/);
  });
});
