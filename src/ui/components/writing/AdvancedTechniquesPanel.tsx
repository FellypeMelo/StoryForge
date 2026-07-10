import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MotifFrequencyCurve } from "../../../domain/techniques/motif-definition";

export interface MotifFormState {
  enabled: boolean;
  object: string;
  wound: string;
  curve: MotifFrequencyCurve;
  progress: number;
}

export interface NarratorFormState {
  enabled: boolean;
  highNeuroticism: boolean;
  dissonance: boolean;
  selfPerception: string;
}

interface AdvancedTechniquesPanelProps {
  motif: MotifFormState;
  onMotifChange: (motif: MotifFormState) => void;
  narrator: NarratorFormState;
  onNarratorChange: (narrator: NarratorFormState) => void;
}

const INPUT_CLASS =
  "w-full px-3 py-2 text-sm bg-bg-surface border border-border-subtle rounded-lg text-text-main placeholder:text-text-muted focus:outline-none focus:border-border-default transition-colors";
const LABEL_CLASS = "text-xs text-text-muted";
const TOGGLE_LABEL_CLASS =
  "flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-main cursor-pointer";
const CHECKBOX_LABEL_CLASS = "flex items-center gap-2 text-xs text-text-main cursor-pointer";

export function AdvancedTechniquesPanel({
  motif,
  onMotifChange,
  narrator,
  onNarratorChange,
}: AdvancedTechniquesPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <aside
      aria-label="Técnicas Avançadas"
      className="w-64 border-l border-border-subtle p-4 overflow-y-auto"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-text-muted hover:text-text-main transition-colors cursor-pointer"
      >
        Técnicas Avançadas
        {open ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
      </button>

      {open && (
        <div className="mt-4 space-y-6">
          <MotifSection motif={motif} onChange={onMotifChange} />
          <NarratorSection narrator={narrator} onChange={onNarratorChange} />
        </div>
      )}
    </aside>
  );
}

function LabeledInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={INPUT_CLASS}
      />
    </div>
  );
}

function MotifSection({
  motif,
  onChange,
}: {
  motif: MotifFormState;
  onChange: (motif: MotifFormState) => void;
}) {
  return (
    <section className="space-y-2">
      <label className={TOGGLE_LABEL_CLASS}>
        <input
          type="checkbox"
          checked={motif.enabled}
          onChange={(e) => onChange({ ...motif, enabled: e.target.checked })}
        />
        Motivo Simbólico
      </label>
      {motif.enabled && <MotifFields motif={motif} onChange={onChange} />}
    </section>
  );
}

function MotifFields({
  motif,
  onChange,
}: {
  motif: MotifFormState;
  onChange: (motif: MotifFormState) => void;
}) {
  return (
    <div className="space-y-2 pl-1">
      <LabeledInput
        id="motif-object"
        label="Símbolo"
        value={motif.object}
        onChange={(object) => onChange({ ...motif, object })}
        placeholder="Ex.: espelho quebrado"
      />
      <LabeledInput
        id="motif-wound"
        label="Ferida associada"
        value={motif.wound}
        onChange={(wound) => onChange({ ...motif, wound })}
        placeholder="Ex.: medo de abandono"
      />
      <div className="space-y-1">
        <label htmlFor="motif-curve" className={LABEL_CLASS}>
          Curva de frequência
        </label>
        <select
          id="motif-curve"
          value={motif.curve}
          onChange={(e) =>
            onChange({ ...motif, curve: e.target.value as MotifFrequencyCurve })
          }
          className={INPUT_CLASS}
        >
          <option value="linear">Linear</option>
          <option value="escalating">Crescente</option>
        </select>
      </div>
      <div className="space-y-1">
        <label htmlFor="motif-progress" className={LABEL_CLASS}>
          Proximidade do confronto ({Math.round(motif.progress * 100)}%)
        </label>
        <input
          id="motif-progress"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={motif.progress}
          onChange={(e) => onChange({ ...motif, progress: Number(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}

function NarratorSection({
  narrator,
  onChange,
}: {
  narrator: NarratorFormState;
  onChange: (narrator: NarratorFormState) => void;
}) {
  return (
    <section className="space-y-2">
      <label className={TOGGLE_LABEL_CLASS}>
        <input
          type="checkbox"
          checked={narrator.enabled}
          onChange={(e) => onChange({ ...narrator, enabled: e.target.checked })}
        />
        Narrador Não-Confiável
      </label>
      {narrator.enabled && <NarratorFields narrator={narrator} onChange={onChange} />}
    </section>
  );
}

function NarratorFields({
  narrator,
  onChange,
}: {
  narrator: NarratorFormState;
  onChange: (narrator: NarratorFormState) => void;
}) {
  return (
    <div className="space-y-2 pl-1">
      <label className={CHECKBOX_LABEL_CLASS}>
        <input
          type="checkbox"
          checked={narrator.highNeuroticism}
          onChange={(e) => onChange({ ...narrator, highNeuroticism: e.target.checked })}
        />
        Alto neuroticismo
      </label>
      <label className={CHECKBOX_LABEL_CLASS}>
        <input
          type="checkbox"
          checked={narrator.dissonance}
          onChange={(e) => onChange({ ...narrator, dissonance: e.target.checked })}
        />
        Dissonância
      </label>
      <LabeledInput
        id="narrator-self-perception"
        label="Autopercepção"
        value={narrator.selfPerception}
        onChange={(selfPerception) => onChange({ ...narrator, selfPerception })}
        placeholder="Ex.: Eu sou racional e calmo"
      />
    </div>
  );
}
