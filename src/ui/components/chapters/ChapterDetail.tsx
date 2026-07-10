import { ChapterOutline } from "../../../domain/chapter-outline";
import { SceneBeat } from "../../../domain/scene-beat";
import { SequelBeat } from "../../../domain/sequel-beat";

interface ChapterDetailProps {
  outline: ChapterOutline;
  onEdit: () => void;
  onDelete: () => void;
}

export function ChapterDetail({ outline, onEdit, onDelete }: ChapterDetailProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-3 rounded-xl bg-bg-surface border border-border-subtle font-sans">
        <span className="text-xs text-text-muted">Polaridade:</span>
        <span
          className={`text-sm font-mono ${
            outline.hasPolarityWarning() ? "text-danger" : "text-success"
          }`}
        >
          {outline.getStartPolarity()} → {outline.getEndPolarity()}
        </span>
        {outline.hasPolarityWarning() && (
          <span className="text-xs text-danger">{outline.getPolarityWarning()}</span>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-1.5 text-xs rounded-lg border border-border-default text-text-main hover:bg-bg-hover transition-colors cursor-pointer active:scale-[0.98]"
          >
            Editar capítulo
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 text-xs rounded-lg border border-border-default text-danger hover:bg-bg-hover transition-colors cursor-pointer active:scale-[0.98]"
          >
            Excluir capítulo
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {outline.getBeats().map((beat, i) => (
          <BeatCard key={i} beat={beat} index={i} />
        ))}
        <CliffhangerCard outline={outline} />
      </div>
    </div>
  );
}

function BeatCard({ beat, index }: { beat: SceneBeat | SequelBeat; index: number }) {
  const isScene = beat instanceof SceneBeat;
  return (
    <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle">
      <div className="flex items-center gap-2 mb-2 font-sans">
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold ${
            isScene ? "bg-accent-soft text-accent" : "border border-border-default text-text-muted"
          }`}
        >
          {isScene ? "CENA" : "SEQUELA"}
        </span>
        <span className="text-xs font-mono text-text-muted">Beat {index + 1}</span>
      </div>
      {isScene ? <SceneBody beat={beat} /> : <SequelBody beat={beat as SequelBeat} />}
    </div>
  );
}

function SceneBody({ beat }: { beat: SceneBeat }) {
  return (
    <dl className="space-y-1 text-sm text-text-main">
      <Row label="Objetivo">{beat.goal}</Row>
      <Row label="Conflito">{beat.conflict}</Row>
      <Row label="Desastre">{beat.disaster.label}</Row>
    </dl>
  );
}

function SequelBody({ beat }: { beat: SequelBeat }) {
  return (
    <dl className="space-y-1 text-sm text-text-main">
      <Row label="Reação">{beat.reaction}</Row>
      <div className="flex gap-1">
        <dt className="text-text-muted font-sans">Dilema:</dt>
        <dd>
          <ul className="list-disc list-inside">
            {beat.dilemmaOptions.map((opt, j) => (
              <li key={j} className="text-text-muted">
                {opt}
              </li>
            ))}
          </ul>
        </dd>
      </div>
      <Row label="Decisão">{beat.decision}</Row>
    </dl>
  );
}

function Row({ label, children }: { label: string; children: string }) {
  return (
    <div className="flex gap-1">
      <dt className="text-text-muted font-sans">{label}:</dt>
      <dd>{children}</dd>
    </div>
  );
}

function CliffhangerCard({ outline }: { outline: ChapterOutline }) {
  return (
    <div className="p-4 rounded-xl bg-bg-surface border border-border-default">
      <div className="flex items-center gap-2 mb-2 font-sans">
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-accent text-on-accent">
          CLIFFHANGER
        </span>
        <span className="text-xs text-text-muted">{outline.getCliffhanger().type.label}</span>
      </div>
      <p className="text-sm text-text-main">{outline.getCliffhanger().description}</p>
    </div>
  );
}
