import { BeatFormValues } from "./chapter-form-model";

interface BeatFieldsProps {
  beat: BeatFormValues;
  index: number;
  onChange: (index: number, patch: Partial<BeatFormValues>) => void;
  onRemove: (index: number) => void;
}

const FIELD_CLASS =
  "mt-1 w-full bg-bg-base border border-border-subtle rounded-lg p-2 text-sm text-text-main font-sans focus:border-border-default";

export function BeatFields({ beat, index, onChange, onRemove }: BeatFieldsProps) {
  const isScene = beat.type === "scene";
  return (
    <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle space-y-3 font-sans">
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold ${
            isScene ? "bg-accent-soft text-accent" : "border border-border-default text-text-muted"
          }`}
        >
          {isScene ? "CENA" : "SEQUELA"}
        </span>
        <span className="text-xs font-mono text-text-muted">Beat {index + 1}</span>
        <button
          type="button"
          aria-label={`Remover beat ${index + 1}`}
          onClick={() => onRemove(index)}
          className="ml-auto px-2 py-1 text-xs rounded-lg text-text-muted hover:bg-bg-hover transition-colors cursor-pointer active:scale-[0.98]"
        >
          &times;
        </button>
      </div>

      {isScene ? <SceneInputs beat={beat} index={index} onChange={onChange} /> : (
        <SequelInputs beat={beat} index={index} onChange={onChange} />
      )}
    </div>
  );
}

type InputsProps = Pick<BeatFieldsProps, "beat" | "index" | "onChange">;

function SceneInputs({ beat, index, onChange }: InputsProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm text-text-muted">
        Objetivo
        <input
          className={FIELD_CLASS}
          value={beat.goal}
          onChange={(e) => onChange(index, { goal: e.target.value })}
        />
      </label>
      <label className="block text-sm text-text-muted">
        Conflito
        <input
          className={FIELD_CLASS}
          value={beat.conflict}
          onChange={(e) => onChange(index, { conflict: e.target.value })}
        />
      </label>
      <label className="block text-sm text-text-muted">
        Desastre
        <select
          className={FIELD_CLASS}
          value={beat.disaster}
          onChange={(e) => onChange(index, { disaster: e.target.value })}
        >
          <option value="no">Não</option>
          <option value="no-and-worse">Não, e pior...</option>
          <option value="yes-but">Sim, mas...</option>
        </select>
      </label>
    </div>
  );
}

function SequelInputs({ beat, index, onChange }: InputsProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm text-text-muted">
        Reação
        <input
          className={FIELD_CLASS}
          value={beat.reaction}
          onChange={(e) => onChange(index, { reaction: e.target.value })}
        />
      </label>
      <label className="block text-sm text-text-muted">
        Dilema (uma opção por linha, todas com custo alto)
        <textarea
          className={`${FIELD_CLASS} resize-y min-h-[60px]`}
          value={beat.dilemma}
          onChange={(e) => onChange(index, { dilemma: e.target.value })}
        />
      </label>
      <label className="block text-sm text-text-muted">
        Decisão
        <input
          className={FIELD_CLASS}
          value={beat.decision}
          onChange={(e) => onChange(index, { decision: e.target.value })}
        />
      </label>
    </div>
  );
}
