import { useState } from "react";
import { Sparkles } from "lucide-react";
import { NarrativeFramework } from "../../../domain/narrative-framework";

export interface BeatSheetContextInput {
  framework: NarrativeFramework;
  previousChapterSummary: string;
  protagonistName: string;
  protagonistGoal: string;
}

interface BeatSheetGeneratorProps {
  chapterNumber: number;
  /** Returns true on success (parent navigates away), false to keep the form open. */
  onGenerate: (context: BeatSheetContextInput) => Promise<boolean>;
  onCancel: () => void;
}

const FRAMEWORKS = NarrativeFramework.all();

const FIELD_CLASS =
  "w-full px-4 py-2.5 rounded-lg bg-bg-surface border border-border-default text-text-main text-sm focus:border-accent transition-colors";

export function BeatSheetGenerator({
  chapterNumber,
  onGenerate,
  onCancel,
}: BeatSheetGeneratorProps) {
  const [framework, setFramework] = useState<NarrativeFramework>(FRAMEWORKS[0]);
  const [protagonistName, setProtagonistName] = useState("");
  const [protagonistGoal, setProtagonistGoal] = useState("");
  const [previousChapterSummary, setPreviousChapterSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate =
    !busy && protagonistName.trim() !== "" && protagonistGoal.trim() !== "";

  async function submit() {
    setError(null);
    if (!canGenerate) {
      setError("Informe o nome e o objetivo do protagonista.");
      return;
    }
    setBusy(true);
    const ok = await onGenerate({
      framework,
      previousChapterSummary: previousChapterSummary.trim(),
      protagonistName: protagonistName.trim(),
      protagonistGoal: protagonistGoal.trim(),
    });
    // Only clear busy if the form is still mounted (generation failed).
    if (!ok) setBusy(false);
  }

  return (
    <section className="space-y-5 p-6 rounded-xl bg-bg-surface border border-border-subtle font-sans">
      <div className="space-y-1">
        <h2 className="text-lg font-serif font-bold text-text-main">
          Gerar beat sheet do capítulo {chapterNumber}
        </h2>
        <p className="text-sm text-text-muted">
          A IA aplica Cena e Sequela de Dwight Swain para estruturar cenas, dilemas e cliffhanger.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="bs-framework" className="block text-sm font-medium text-text-main">
          Framework
        </label>
        <select
          id="bs-framework"
          value={framework.value}
          onChange={(e) => {
            const found = FRAMEWORKS.find((f) => f.value === e.target.value);
            if (found) setFramework(found);
          }}
          className={FIELD_CLASS}
        >
          {FRAMEWORKS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="bs-protagonist" className="block text-sm font-medium text-text-main">
          Protagonista
        </label>
        <input
          id="bs-protagonist"
          type="text"
          value={protagonistName}
          onChange={(e) => setProtagonistName(e.target.value)}
          placeholder="Nome do protagonista"
          className={FIELD_CLASS}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="bs-goal" className="block text-sm font-medium text-text-main">
          Objetivo do protagonista
        </label>
        <input
          id="bs-goal"
          type="text"
          value={protagonistGoal}
          onChange={(e) => setProtagonistGoal(e.target.value)}
          placeholder="O que ele quer neste capítulo"
          className={FIELD_CLASS}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="bs-previous" className="block text-sm font-medium text-text-main">
          Resumo do capítulo anterior (opcional)
        </label>
        <textarea
          id="bs-previous"
          value={previousChapterSummary}
          onChange={(e) => setPreviousChapterSummary(e.target.value)}
          placeholder="Onde a história parou"
          rows={3}
          className={`${FIELD_CLASS} resize-none`}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={submit}
          disabled={!canGenerate}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-accent text-on-accent text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={16} aria-hidden />
          {busy ? "Gerando..." : "Gerar beat sheet"}
        </button>
        <button
          onClick={onCancel}
          disabled={busy}
          className="px-5 py-2.5 rounded-lg border border-border-default text-text-main text-sm hover:bg-bg-hover transition-colors cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </section>
  );
}
