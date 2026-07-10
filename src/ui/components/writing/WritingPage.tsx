import { useEffect, useMemo, useRef, useState } from "react";
import { LlmPort } from "../../../domain/ideation/ports/llm-port";
import { WritingRequest } from "../../../domain/writing-request";
import { PointOfView } from "../../../domain/value-objects/point-of-view";
import { SceneId } from "../../../domain/value-objects/scene-id";
import { GenerateProseUseCase } from "../../../application/writing/generate-prose";
import {
  RefineProseUseCase,
  ProseAction,
} from "../../../application/writing/refine-prose";
import {
  analyzeProse,
  ProseHighlight,
} from "../../../application/writing/analyze-prose";
import { WritingSidebar } from "./WritingSidebar";
import { RsipPanel, RsipResult } from "./RsipPanel";

interface WritingPageProps {
  llmPort: LlmPort;
  bookId: string;
  onBack: () => void;
}

type PendingAction = ProseAction | "generate" | null;

const ACTION_LABELS: Record<ProseAction, { idle: string; busy: string }> = {
  rewrite: { idle: "Reescrever (EPRL)", busy: "Reescrevendo..." },
  expand: { idle: "Expandir", busy: "Expandindo..." },
  refine: { idle: "Refinar", busy: "Refinando..." },
};

// WordLimitPolicy exige 500-800 palavras por beat.
const DEFAULT_WORD_LIMIT = 600;

const CONTROL_CLASS =
  "px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
const SECONDARY_BTN = `${CONTROL_CLASS} border border-border-default text-text-main hover:bg-bg-hover`;
const PRIMARY_BTN = `${CONTROL_CLASS} bg-accent text-on-accent hover:bg-accent-hover font-medium`;

function buildRequest(beatSummary: string, characterName: string): WritingRequest {
  return WritingRequest.create({
    sceneId: SceneId.generate(),
    beatSummary,
    pov: PointOfView.create("third-limited"),
    characterName,
    wordLimit: DEFAULT_WORD_LIMIT,
  });
}

function replaceRange(
  text: string,
  start: number,
  end: number,
  revised: string,
): string {
  return start < end ? text.slice(0, start) + revised + text.slice(end) : revised;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function WritingPage({ llmPort, bookId, onBack }: WritingPageProps) {
  const draftKey = `storyforge_draft_${bookId}`;
  const [content, setContent] = useState(
    () => localStorage.getItem(draftKey) ?? "",
  );
  const [highlights, setHighlights] = useState<ProseHighlight[]>([]);
  const [beatSummary, setBeatSummary] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [pending, setPending] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [rsip, setRsip] = useState<RsipResult | null>(null);
  const selectionRef = useRef({ start: 0, end: 0 });

  const generateUseCase = useMemo(
    () => new GenerateProseUseCase(llmPort),
    [llmPort],
  );
  const refineUseCase = useMemo(() => new RefineProseUseCase(llmPort), [llmPort]);

  useEffect(() => {
    setHighlights(analyzeProse(content));
  }, [content]);

  // Auto-save com debounce, chave isolada por livro.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.trim()) localStorage.setItem(draftKey, content);
    }, 1000);
    return () => clearTimeout(timer);
  }, [content, draftKey]);

  function handleSelect(event: React.SyntheticEvent<HTMLTextAreaElement>) {
    const { selectionStart, selectionEnd } = event.currentTarget;
    selectionRef.current = { start: selectionStart, end: selectionEnd };
  }

  async function handleGenerate() {
    setPending("generate");
    setError(null);
    try {
      const request = buildRequest(beatSummary, characterName);
      const result = await generateUseCase.execute(request);
      const { draft, critique, finalVersion } = result.proseOutput;
      setRsip({ draft, critique, finalVersion });
      setContent(finalVersion);
      selectionRef.current = { start: 0, end: 0 };
    } catch {
      setError("Falha ao gerar prosa. Verifique a conexão com o modelo e tente novamente.");
    } finally {
      setPending(null);
    }
  }

  async function handleAction(action: ProseAction) {
    const { start, end } = selectionRef.current;
    const target = start < end ? content.slice(start, end) : content;
    setPending(action);
    setError(null);
    try {
      const revised = await refineUseCase.execute(action, target);
      setContent(replaceRange(content, start, end, revised));
      selectionRef.current = { start: 0, end: 0 };
    } catch {
      setError("Falha ao aplicar a ação no texto. Tente novamente.");
    } finally {
      setPending(null);
    }
  }

  const busy = pending !== null;
  const canGenerate =
    !busy && beatSummary.trim() !== "" && characterName.trim() !== "";

  return (
    <div className="h-screen flex flex-col bg-bg-base text-text-main font-sans">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
        <button onClick={onBack} className={SECONDARY_BTN}>
          &larr; Voltar
        </button>
        <h1 className="text-lg font-serif font-bold">Editor de Escrita</h1>
        <span className="ml-auto font-mono text-xs text-text-muted">
          {countWords(content)} palavras
        </span>
        {content.trim() !== "" && (
          <div className="flex gap-2">
            {(Object.keys(ACTION_LABELS) as ProseAction[]).map((action) => (
              <button
                key={action}
                onClick={() => handleAction(action)}
                disabled={busy}
                className={SECONDARY_BTN}
              >
                {pending === action
                  ? ACTION_LABELS[action].busy
                  : ACTION_LABELS[action].idle}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={PRIMARY_BTN}
        >
          {pending === "generate" ? "Gerando..." : "Gerar Prosa"}
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="mx-4 mt-3 px-4 py-2 text-sm text-danger bg-bg-surface border border-border-subtle rounded-lg"
        >
          {error}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <WritingSidebar
          beatSummary={beatSummary}
          characterName={characterName}
          onBeatSummaryChange={setBeatSummary}
          onCharacterNameChange={setCharacterName}
          highlights={highlights}
        />

        <main className="flex-1 p-4 overflow-y-auto">
          <textarea
            aria-label="Editor de prosa"
            className="w-full h-full p-4 bg-bg-surface border border-border-subtle rounded-lg font-serif text-sm leading-relaxed text-text-main resize-none placeholder:text-text-muted focus:outline-none focus:border-border-default transition-colors"
            placeholder="Comece a escrever..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onSelect={handleSelect}
          />
        </main>

        <RsipPanel result={rsip} />
      </div>
    </div>
  );
}

export default WritingPage;
