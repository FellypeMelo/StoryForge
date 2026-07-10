import { useCallback, useEffect, useMemo, useState } from "react";
import { NarrativeFramework, BEATS_MAP } from "../../../domain/narrative-framework";
import { StoryStructure } from "../../../domain/story-structure";
import { StoryStructureRepository } from "../../../domain/ports/story-structure-repository";
import { LocalStorageStructureRepository } from "../../../infrastructure/local/local-storage-structure-repository";
import { BookId } from "../../../domain/value-objects/book-id";
import { BeatCard } from "./BeatCard";

export interface StructurePageProps {
  bookId: string;
  onBack: () => void;
  /** Porta injetável para testes; padrão offline-first via localStorage. */
  repository?: StoryStructureRepository;
}

type SaveStatus = "saved" | "dirty" | "error";

const FRAMEWORKS = NarrativeFramework.all();

function emptyBeats(framework: NarrativeFramework): string[] {
  return Array(BEATS_MAP[framework.name].length).fill("");
}

function parseBookId(bookId: string): BookId | null {
  try {
    return BookId.create(bookId);
  } catch {
    return null;
  }
}

export default function StructurePage({ bookId, onBack, repository }: StructurePageProps) {
  const repo = useMemo(
    () => repository ?? new LocalStorageStructureRepository(),
    [repository],
  );
  const parsedBookId = useMemo(() => parseBookId(bookId), [bookId]);

  const [selected, setSelected] = useState<NarrativeFramework>(FRAMEWORKS[0]);
  const [beats, setBeats] = useState<string[]>(emptyBeats(FRAMEWORKS[0]));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");

  useEffect(() => {
    if (!parsedBookId) {
      setLoadError("Identificador de livro inválido.");
      setLoading(false);
      return;
    }
    let active = true;
    repo
      .getByBookId(parsedBookId)
      .then((structure) => {
        if (!active) return;
        if (structure) {
          setSelected(structure.getFramework());
          setBeats(structure.allBeats());
        }
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoadError("Não foi possível carregar a estrutura deste livro.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [parsedBookId, repo]);

  const persist = useCallback(
    async (framework: NarrativeFramework, beatValues: string[]) => {
      if (!parsedBookId) return;
      try {
        await repo.save(parsedBookId, StoryStructure.create(framework, beatValues));
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    },
    [parsedBookId, repo],
  );

  function handleSelect(framework: NarrativeFramework) {
    const reset = emptyBeats(framework);
    setSelected(framework);
    setBeats(reset);
    void persist(framework, reset);
  }

  function updateBeat(index: number, value: string) {
    setBeats((prev) => prev.map((b, i) => (i === index ? value : b)));
    setSaveStatus("dirty");
  }

  const structure = StoryStructure.create(selected, beats);
  const missingCount = structure.missingBeats().length;
  const filledCount = structure.beatCount() - missingCount;

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
          Estrutura Narrativa
        </h1>
      </header>

      {loading && <p className="text-text-muted font-sans">Carregando estrutura…</p>}
      {loadError && <p className="text-danger font-sans">{loadError}</p>}

      {!loading && !loadError && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {FRAMEWORKS.map((fw) => (
              <button
                key={fw.value}
                onClick={() => handleSelect(fw)}
                aria-pressed={selected.value === fw.value}
                className={`p-3 rounded-lg border text-left font-sans transition-colors cursor-pointer active:scale-[0.98] ${
                  selected.value === fw.value
                    ? "bg-accent text-on-accent border-transparent"
                    : "bg-bg-surface text-text-main border-border-subtle hover:bg-bg-hover"
                }`}
              >
                <div className="font-medium">{fw.name}</div>
                <div className="text-sm opacity-70 font-mono">
                  {BEATS_MAP[fw.name].length} beats
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 p-3 rounded-xl bg-bg-surface border border-border-subtle font-sans">
            <span className="text-sm">
              {structure.isSuccess() ? (
                <span className="text-success">Estrutura completa</span>
              ) : (
                <span className="text-text-muted">
                  {missingCount} beat{missingCount > 1 ? "s" : ""} pendente
                  {missingCount > 1 ? "s" : ""}
                </span>
              )}
            </span>
            {/* Regra visual: sem barras com trilho preenchido — linha fina + fração */}
            <div className="flex-1" aria-hidden>
              <div
                className="h-px bg-accent transition-all"
                style={{ width: `${(filledCount / structure.beatCount()) * 100}%` }}
              />
            </div>
            <span className="font-mono text-sm text-text-main">
              {filledCount}/{structure.beatCount()}
            </span>
            <SaveIndicator status={saveStatus} />
          </div>

          <div className="space-y-4">
            {BEATS_MAP[selected.name].map((label, i) => (
              <BeatCard
                key={label}
                index={i}
                label={label}
                value={beats[i] ?? ""}
                onChange={(value) => updateBeat(i, value)}
                onBlur={() => void persist(selected, beats)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "error") {
    return <span className="text-xs text-danger">Erro ao salvar</span>;
  }
  return (
    <span className="text-xs text-text-muted">
      {status === "saved" ? "Salvo" : "Não salvo"}
    </span>
  );
}
