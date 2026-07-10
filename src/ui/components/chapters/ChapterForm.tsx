import { FormEvent, useState } from "react";
import { ChapterOutline } from "../../../domain/chapter-outline";
import { ChapterId } from "../../../domain/value-objects/chapter-id";
import { BeatFields } from "./BeatFields";
import {
  BeatFormValues,
  ChapterFormValues,
  defaultFormValues,
  emptyBeat,
  formValuesFromOutline,
  outlineFromFormValues,
  translateDomainError,
} from "./chapter-form-model";

interface ChapterFormProps {
  chapterNumber: number;
  initial?: ChapterOutline;
  onSubmit: (outline: ChapterOutline) => void;
  onCancel: () => void;
}

const FIELD_CLASS =
  "mt-1 w-full bg-bg-base border border-border-subtle rounded-lg p-2 text-sm text-text-main font-sans focus:border-border-default";
const SECONDARY_BUTTON =
  "px-4 py-2 text-sm font-sans rounded-lg border border-border-default text-text-main hover:bg-bg-hover transition-colors cursor-pointer active:scale-[0.98]";

export function ChapterForm({ chapterNumber, initial, onSubmit, onCancel }: ChapterFormProps) {
  const [values, setValues] = useState<ChapterFormValues>(() =>
    initial ? formValuesFromOutline(initial) : defaultFormValues(),
  );
  const [error, setError] = useState<string | null>(null);

  function patchBeat(index: number, patch: Partial<BeatFormValues>) {
    setValues((prev) => ({
      ...prev,
      beats: prev.beats.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    }));
  }

  function addBeat(type: "scene" | "sequel") {
    setValues((prev) => ({ ...prev, beats: [...prev.beats, emptyBeat(type)] }));
  }

  function removeBeat(index: number) {
    setValues((prev) => ({ ...prev, beats: prev.beats.filter((_, i) => i !== index) }));
  }

  function patch(update: Partial<ChapterFormValues>) {
    setValues((prev) => ({ ...prev, ...update }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const id = initial ? initial.getId() : ChapterId.generate();
      onSubmit(outlineFromFormValues(values, chapterNumber, id));
    } catch (err) {
      setError(translateDomainError(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <h2 className="text-xl font-serif font-bold text-text-main">
        Capítulo {chapterNumber}
      </h2>

      <div className="space-y-3">
        {values.beats.map((beat, i) => (
          <BeatFields key={i} beat={beat} index={i} onChange={patchBeat} onRemove={removeBeat} />
        ))}
      </div>

      <div className="flex gap-2 font-sans">
        <button type="button" onClick={() => addBeat("scene")} className={SECONDARY_BUTTON}>
          + Cena
        </button>
        <button type="button" onClick={() => addBeat("sequel")} className={SECONDARY_BUTTON}>
          + Sequela
        </button>
      </div>

      <fieldset className="p-4 rounded-xl bg-bg-surface border border-border-subtle space-y-3 font-sans">
        <legend className="px-1 text-xs font-bold text-text-muted">Cliffhanger</legend>
        <label className="block text-sm text-text-muted">
          Tipo de cliffhanger
          <select
            className={FIELD_CLASS}
            value={values.cliffhangerType}
            onChange={(e) => patch({ cliffhangerType: e.target.value })}
          >
            <option value="pre-point">Pre-point</option>
            <option value="climactic">Climático</option>
            <option value="post-point">Post-point</option>
          </select>
        </label>
        <label className="block text-sm text-text-muted">
          Descrição do cliffhanger
          <input
            className={FIELD_CLASS}
            value={values.cliffhangerDescription}
            onChange={(e) => patch({ cliffhangerDescription: e.target.value })}
          />
        </label>
      </fieldset>

      <div className="grid grid-cols-2 gap-3 font-sans">
        <PolaritySelect
          label="Polaridade inicial"
          value={values.startPolarity}
          onChange={(v) => patch({ startPolarity: v })}
        />
        <PolaritySelect
          label="Polaridade final"
          value={values.endPolarity}
          onChange={(v) => patch({ endPolarity: v })}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-sans text-danger">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 font-sans">
        <button type="button" onClick={onCancel} className={SECONDARY_BUTTON}>
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-sans font-medium rounded-lg bg-accent text-on-accent hover:bg-accent-hover transition-colors cursor-pointer active:scale-[0.98]"
        >
          Salvar capítulo
        </button>
      </div>
    </form>
  );
}

function PolaritySelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: "positive" | "negative";
  onChange: (value: "positive" | "negative") => void;
}) {
  return (
    <label className="block text-sm text-text-muted">
      {label}
      <select
        className={FIELD_CLASS}
        value={value}
        onChange={(e) => onChange(e.target.value as "positive" | "negative")}
      >
        <option value="positive">+ (positiva)</option>
        <option value="negative">- (negativa)</option>
      </select>
    </label>
  );
}
