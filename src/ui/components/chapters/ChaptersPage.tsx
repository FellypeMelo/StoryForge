import { useEffect, useMemo, useState } from "react";
import { ListOrdered, Sparkles } from "lucide-react";
import { ChapterOutline } from "../../../domain/chapter-outline";
import { ChapterOutlineRepository } from "../../../domain/ports/chapter-outline-repository";
import { BookId } from "../../../domain/value-objects/book-id";
import { ChapterId } from "../../../domain/value-objects/chapter-id";
import { NarrativeFramework } from "../../../domain/narrative-framework";
import { LlmPort } from "../../../domain/ideation/ports/llm-port";
import { DetectStructuralErrorsUseCase } from "../../../application/structure/detect-structural-errors";
import { GenerateBeatSheetUseCase } from "../../../application/structure/generate-beat-sheet";
import { LocalStorageChapterRepository } from "../../../infrastructure/local/local-storage-chapter-repository";
import { DummyLlmPort } from "../../../infrastructure/llm/dummy-llm-port";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { useToast } from "../shared/Toast";
import { ChapterForm } from "./ChapterForm";
import { ChapterDetail } from "./ChapterDetail";
import { BeatSheetGenerator } from "./BeatSheetGenerator";
import { toChapterData } from "./structural-analysis";

export interface ChaptersPageProps {
  bookId: string;
  onBack: () => void;
  /** Porta injetável para testes; padrão offline-first via localStorage. */
  repository?: ChapterOutlineRepository;
  /** Motor de IA; padrão simulado para uso offline/testes. */
  llmPort?: LlmPort;
}

type PageMode = "list" | "create" | "edit" | "generate";

function parseBookId(bookId: string): BookId | null {
  try {
    return BookId.create(bookId);
  } catch {
    return null;
  }
}

export default function ChaptersPage({
  bookId,
  onBack,
  repository,
  llmPort,
}: ChaptersPageProps) {
  const repo = useMemo(
    () => repository ?? new LocalStorageChapterRepository(),
    [repository],
  );
  const beatSheetUseCase = useMemo(
    () => new GenerateBeatSheetUseCase(llmPort ?? new DummyLlmPort()),
    [llmPort],
  );
  const parsedBookId = useMemo(() => parseBookId(bookId), [bookId]);
  const { showToast } = useToast();

  const [outlines, setOutlines] = useState<ChapterOutline[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<PageMode>("list");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!parsedBookId) {
      setLoadError("Identificador de livro inválido.");
      setLoading(false);
      return;
    }
    let active = true;
    repo
      .getByBookId(parsedBookId)
      .then((loaded) => {
        if (!active) return;
        setOutlines(loaded);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoadError("Não foi possível carregar os capítulos deste livro.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [parsedBookId, repo]);

  const structuralErrors = useMemo(
    () => new DetectStructuralErrorsUseCase().execute(outlines.map(toChapterData)),
    [outlines],
  );

  const current = outlines[Math.min(selectedIndex, outlines.length - 1)];
  const nextChapterNumber =
    outlines.reduce((max, o) => Math.max(max, o.getChapterNumber()), 0) + 1;

  async function persist(next: ChapterOutline[], successMessage: string) {
    setOutlines(next);
    if (!parsedBookId) return;
    try {
      await repo.save(parsedBookId, next);
      showToast(successMessage);
    } catch {
      showToast("Não foi possível salvar os capítulos.", "error");
    }
  }

  function handleCreate(outline: ChapterOutline) {
    void persist([...outlines, outline], "Capítulo salvo.");
    setSelectedIndex(outlines.length);
    setMode("list");
  }

  async function handleGenerate(context: {
    framework: NarrativeFramework;
    previousChapterSummary: string;
    protagonistName: string;
    protagonistGoal: string;
  }): Promise<boolean> {
    try {
      const result = await beatSheetUseCase.execute({
        chapterId: ChapterId.generate(),
        chapterNumber: nextChapterNumber,
        context,
      });
      await persist([...outlines, result.outline], "Beat sheet gerado com IA.");
      setSelectedIndex(outlines.length);
      setMode("list");
      return true;
    } catch {
      showToast("Falha ao gerar o beat sheet. Tente novamente.", "error");
      return false;
    }
  }

  function handleEdit(outline: ChapterOutline) {
    void persist(
      outlines.map((o, i) => (i === selectedIndex ? outline : o)),
      "Capítulo salvo.",
    );
    setMode("list");
  }

  function handleDelete() {
    void persist(
      outlines.filter((_, i) => i !== selectedIndex),
      "Capítulo excluído.",
    );
    setSelectedIndex(0);
    setConfirmingDelete(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-sm font-sans border border-border-default rounded-lg text-text-muted hover:bg-bg-hover transition-colors cursor-pointer active:scale-[0.98]"
        >
          &larr; Voltar
        </button>
        <h1 className="text-2xl font-serif font-bold text-text-main">
          Planejamento de Capítulos
        </h1>
      </header>

      {loading && <p className="text-text-muted font-sans">Carregando capítulos…</p>}
      {loadError && <p className="text-danger font-sans">{loadError}</p>}

      {!loading && !loadError && mode === "create" && (
        <ChapterForm
          chapterNumber={nextChapterNumber}
          onSubmit={handleCreate}
          onCancel={() => setMode("list")}
        />
      )}

      {!loading && !loadError && mode === "edit" && current && (
        <ChapterForm
          chapterNumber={current.getChapterNumber()}
          initial={current}
          onSubmit={handleEdit}
          onCancel={() => setMode("list")}
        />
      )}

      {!loading && !loadError && mode === "generate" && (
        <BeatSheetGenerator
          chapterNumber={nextChapterNumber}
          onGenerate={handleGenerate}
          onCancel={() => setMode("list")}
        />
      )}

      {!loading && !loadError && mode === "list" && outlines.length === 0 && (
        <EmptyState
          onCreate={() => setMode("create")}
          onGenerate={() => setMode("generate")}
        />
      )}

      {!loading && !loadError && mode === "list" && outlines.length > 0 && (
        <>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 font-sans">
            {outlines.map((o, i) => (
              <button
                key={o.getId().value}
                onClick={() => setSelectedIndex(i)}
                aria-pressed={i === selectedIndex}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer active:scale-[0.98] ${
                  i === selectedIndex
                    ? "bg-accent text-on-accent"
                    : "bg-bg-surface text-text-main border border-border-subtle hover:bg-bg-hover"
                }`}
              >
                Cap. {o.getChapterNumber()}
              </button>
            ))}
            <button
              onClick={() => setMode("create")}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border border-border-default text-text-muted hover:bg-bg-hover transition-colors cursor-pointer active:scale-[0.98]"
            >
              + Novo capítulo
            </button>
            <button
              onClick={() => setMode("generate")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border border-border-default text-accent hover:bg-bg-hover transition-colors cursor-pointer active:scale-[0.98]"
            >
              <Sparkles size={14} aria-hidden />
              Gerar com IA
            </button>
          </div>

          {structuralErrors.length > 0 && (
            <section className="p-4 rounded-xl bg-bg-surface border border-border-subtle space-y-2">
              <h2 className="text-sm font-serif font-bold text-text-main">
                Análise estrutural
              </h2>
              <ul className="space-y-1">
                {structuralErrors.map((error, i) => (
                  <li key={i} className="text-sm font-sans text-danger">
                    <span className="font-medium">{error.type.label}</span> — {error.message}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {current && (
            <ChapterDetail
              outline={current}
              onEdit={() => setMode("edit")}
              onDelete={() => setConfirmingDelete(true)}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        title="Excluir capítulo"
        description={`O planejamento do capítulo ${current?.getChapterNumber() ?? ""} será removido permanentemente.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}

function EmptyState({
  onCreate,
  onGenerate,
}: {
  onCreate: () => void;
  onGenerate: () => void;
}) {
  return (
    <div className="py-20 border-2 border-dashed border-border-subtle rounded-xl flex flex-col items-center justify-center text-center space-y-6">
      <div className="p-4 bg-bg-hover rounded-full text-text-muted">
        <ListOrdered size={40} strokeWidth={1.5} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-serif text-text-main">Nenhum capítulo planejado</h3>
        <p className="text-text-muted max-w-xs mx-auto font-sans text-sm">
          Estruture sua narrativa capítulo a capítulo com cenas, sequelas e cliffhangers.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onCreate}
          className="bg-accent text-on-accent px-6 py-2.5 rounded-lg font-sans font-bold text-sm hover:bg-accent-hover transition-colors cursor-pointer active:scale-[0.98]"
        >
          Planejar primeiro capítulo
        </button>
        <button
          onClick={onGenerate}
          className="flex items-center gap-1.5 border border-border-default text-accent px-6 py-2.5 rounded-lg font-sans font-bold text-sm hover:bg-bg-hover transition-colors cursor-pointer active:scale-[0.98]"
        >
          <Sparkles size={16} aria-hidden />
          Gerar com IA
        </button>
      </div>
    </div>
  );
}
