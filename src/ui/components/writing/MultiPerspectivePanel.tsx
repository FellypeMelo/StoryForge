import { useMemo, useState } from "react";
import { Columns3 } from "lucide-react";
import { LlmPort } from "../../../domain/ideation/ports/llm-port";
import {
  MultiPerspectiveUseCase,
  PerspectiveVariation,
} from "../../../application/techniques/multi-perspective";

interface MultiPerspectivePanelProps {
  llmPort: LlmPort;
  getExcerpt: () => string;
  onInsert: (text: string) => void;
}

const TRIGGER_CLASS =
  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border-default text-text-main hover:bg-bg-hover transition-colors cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

const INSERT_BTN_CLASS =
  "px-2 py-1 text-xs rounded-lg bg-accent text-on-accent hover:bg-accent-hover font-medium transition-colors cursor-pointer";

export function MultiPerspectivePanel({
  llmPort,
  getExcerpt,
  onInsert,
}: MultiPerspectivePanelProps) {
  const useCase = useMemo(() => new MultiPerspectiveUseCase(llmPort), [llmPort]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variations, setVariations] = useState<PerspectiveVariation[] | null>(null);

  async function handleGenerate() {
    setPending(true);
    setError(null);
    try {
      const result = await useCase.execute(getExcerpt());
      setVariations(result.variations);
    } catch {
      setError("Falha ao gerar variações de perspectiva. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-label="Multi-Perspectiva" className="px-4 pt-3 space-y-3">
      <button onClick={handleGenerate} disabled={pending} className={TRIGGER_CLASS}>
        <Columns3 size={16} aria-hidden />
        {pending ? "Gerando variações..." : "Multi-Perspectiva"}
      </button>

      {error && (
        <div
          role="alert"
          className="px-4 py-2 text-sm text-danger bg-bg-surface border border-border-subtle rounded-lg"
        >
          {error}
        </div>
      )}

      {variations && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3">
          {variations.map((variation) => (
            <VariationCard
              key={variation.style}
              variation={variation}
              onInsert={onInsert}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function VariationCard({
  variation,
  onInsert,
}: {
  variation: PerspectiveVariation;
  onInsert: (text: string) => void;
}) {
  return (
    <div className="p-3 bg-bg-surface border border-border-subtle rounded-xl space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">
        {variation.label}
      </h3>
      <p className="text-xs font-serif leading-relaxed text-text-main">{variation.text}</p>
      <button onClick={() => onInsert(variation.text)} className={INSERT_BTN_CLASS}>
        Inserir
      </button>
    </div>
  );
}
