import { useEffect, useMemo, useRef, useState } from "react";
import { LlmPort } from "../../../domain/ideation/ports/llm-port";
import { WritingRequest } from "../../../domain/writing-request";
import { PointOfView } from "../../../domain/value-objects/point-of-view";
import { SceneId } from "../../../domain/value-objects/scene-id";
import { ProjectId } from "../../../domain/value-objects/project-id";
import { GenerateProseUseCase } from "../../../application/writing/generate-prose";
import { ContextInjector } from "../../../application/writing/context-injector";
import { TauriSearchPort } from "../../../infrastructure/tauri/tauri-search-port";
import { TauriSemanticSearchPort } from "../../../infrastructure/tauri/tauri-semantic-search-port";
import {
  RefineProseUseCase,
  ProseAction,
} from "../../../application/writing/refine-prose";
import {
  analyzeProse,
  ProseHighlight,
} from "../../../application/writing/analyze-prose";
import { WritingSidebar } from "./WritingSidebar";
import { ProseEditor } from "./ProseEditor";
import { RsipPanel, RsipResult } from "./RsipPanel";
import { MultiPerspectivePanel } from "./MultiPerspectivePanel";
import {
  AdvancedTechniquesPanel,
  MotifFormState,
  NarratorFormState,
} from "./AdvancedTechniquesPanel";
import { MotifDefinition } from "../../../domain/techniques/motif-definition";
import { MotifInjector } from "../../../domain/techniques/motif-injector";
import { UnreliableNarratorConfig } from "../../../domain/techniques/unreliable-narrator-config";
import { UnreliableNarratorPromptEnhancer } from "../../../domain/techniques/unreliable-narrator-prompt-enhancer";

interface WritingPageProps {
  llmPort: LlmPort;
  bookId: string;
  projectId: string;
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

function buildRequest(
  beatSummary: string,
  characterName: string,
  ragContext?: string,
): WritingRequest {
  return WritingRequest.create({
    sceneId: SceneId.generate(),
    beatSummary,
    pov: PointOfView.create("third-limited"),
    characterName,
    wordLimit: DEFAULT_WORD_LIMIT,
    ragContext: ragContext && ragContext.trim() !== "" ? ragContext : undefined,
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

// Motif and Narrador are UI-only techniques (no changes to GenerateProseUseCase /
// WritingRequest): their instruction fragments ride along inside ragContext.
function applyMotif(base: string, motif: MotifFormState): string {
  if (!motif.enabled || !motif.object.trim() || !motif.wound.trim()) return base;
  try {
    const definition = MotifDefinition.create({
      object: motif.object,
      associatedWound: motif.wound,
      frequencyCurve: motif.curve,
    });
    return MotifInjector.inject(base, definition, motif.progress);
  } catch {
    return base;
  }
}

function applyNarrator(base: string, narrator: NarratorFormState): string {
  if (!narrator.enabled) return base;
  try {
    const config = UnreliableNarratorConfig.create({
      highNeuroticism: narrator.highNeuroticism,
      dissonance: narrator.dissonance,
      selfPerception: narrator.selfPerception,
    });
    return UnreliableNarratorPromptEnhancer.enhance(base, config);
  } catch {
    return base;
  }
}

function buildTechniqueDirectives(motif: MotifFormState, narrator: NarratorFormState): string {
  return applyNarrator(applyMotif("", motif), narrator);
}

function mergeContext(ragContext: string, directives: string): string {
  return [ragContext, directives].filter((s) => s.trim() !== "").join("\n\n");
}

export function WritingPage({ llmPort, bookId, projectId, onBack }: WritingPageProps) {
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
  const [motif, setMotif] = useState<MotifFormState>(DEFAULT_MOTIF);
  const [narrator, setNarrator] = useState<NarratorFormState>(DEFAULT_NARRATOR);
  const selectionRef = useRef({ start: 0, end: 0 });

  const generateUseCase = useMemo(
    () => new GenerateProseUseCase(llmPort),
    [llmPort],
  );
  const refineUseCase = useMemo(() => new RefineProseUseCase(llmPort), [llmPort]);
  const contextInjector = useMemo(
    () => new ContextInjector(new TauriSearchPort(bookId), new TauriSemanticSearchPort(bookId)),
    [bookId],
  );

  // Best-effort keyword RAG: pull Codex context for the beat before generating.
  // Never blocks generation — a search failure or invalid id yields empty context.
  async function resolveRagContext(beat: string): Promise<string> {
    try {
      const parsed = ProjectId.create(projectId);
      return await contextInjector.inject(parsed, beat);
    } catch {
      return "";
    }
  }

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

  function handleSelectionChange(start: number, end: number) {
    selectionRef.current = { start, end };
  }

  async function handleGenerate() {
    setPending("generate");
    setError(null);
    try {
      const ragContext = await resolveRagContext(beatSummary);
      const directives = buildTechniqueDirectives(motif, narrator);
      const request = buildRequest(
        beatSummary,
        characterName,
        mergeContext(ragContext, directives),
      );
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

  function getMpsExcerpt(): string {
    const { start, end } = selectionRef.current;
    return start < end ? content.slice(start, end) : content;
  }

  function handleInsertVariation(text: string) {
    const { start, end } = selectionRef.current;
    setContent(
      start < end ? replaceRange(content, start, end, text) : content ? `${content}\n\n${text}` : text,
    );
    selectionRef.current = { start: 0, end: 0 };
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

      {content.trim() !== "" && (
        <MultiPerspectivePanel
          llmPort={llmPort}
          getExcerpt={getMpsExcerpt}
          onInsert={handleInsertVariation}
        />
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
          <ProseEditor
            value={content}
            onChange={setContent}
            onSelectionChange={handleSelectionChange}
            placeholder="Comece a escrever..."
          />
        </main>

        <AdvancedTechniquesPanel
          motif={motif}
          onMotifChange={setMotif}
          narrator={narrator}
          onNarratorChange={setNarrator}
        />

        <RsipPanel result={rsip} />
      </div>
    </div>
  );
}

export default WritingPage;
