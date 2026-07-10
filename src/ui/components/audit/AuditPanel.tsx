import { useEffect, useMemo, useState } from "react";
import { ChapterOutline } from "../../../domain/chapter-outline";
import { ChapterOutlineRepository } from "../../../domain/ports/chapter-outline-repository";
import { BookId } from "../../../domain/value-objects/book-id";
import { AuditAxis, AuditFinding } from "../../../domain/audit/audit-report";
import { BadCopPipeline } from "../../../application/audit/bad-cop-pipeline";
import { LocalStorageChapterRepository } from "../../../infrastructure/local/local-storage-chapter-repository";
import { DetectorAlert, HeuristicDetector } from "../../../domain/audit/detectors/heuristic-detector";
import { BlacklistWordDetector } from "../../../domain/audit/detectors/blacklist-word-detector";
import { RepetitionDetector } from "../../../domain/audit/detectors/repetition-detector";
import { AdverbDensityDetector } from "../../../domain/audit/detectors/adverb-density-detector";

export interface AuditPanelProps {
  bookId: string;
  onBack: () => void;
  /** Porta injetável para testes; padrão offline-first via localStorage. */
  repository?: ChapterOutlineRepository;
}

const AXIS_ORDER: AuditAxis[] = [
  AuditAxis.Causation,
  AuditAxis.Agency,
  AuditAxis.ShowDontTell,
  AuditAxis.AntiPattern,
];

const AXIS_LABELS: Record<AuditAxis, string> = {
  [AuditAxis.Causation]: "Causação",
  [AuditAxis.Agency]: "Agência",
  [AuditAxis.ShowDontTell]: "Show-Don't-Tell",
  [AuditAxis.AntiPattern]: "Anti-Pattern",
};

const DETECTORS: HeuristicDetector[] = [
  new BlacklistWordDetector(),
  new RepetitionDetector(),
  new AdverbDensityDetector(),
];

function parseBookId(bookId: string): BookId | null {
  try {
    return BookId.create(bookId);
  } catch {
    return null;
  }
}

function readDraftProse(bookId: string): string {
  return localStorage.getItem(`storyforge_draft_${bookId}`) ?? "";
}

export default function AuditPanel({ bookId, onBack, repository }: AuditPanelProps) {
  const repo = useMemo(() => repository ?? new LocalStorageChapterRepository(), [repository]);
  const parsedBookId = useMemo(() => parseBookId(bookId), [bookId]);
  const prose = useMemo(() => readDraftProse(bookId), [bookId]);

  const [outlines, setOutlines] = useState<ChapterOutline[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  const report = useMemo(() => BadCopPipeline.run({ outlines, prose }), [outlines, prose]);

  const detectorAlerts = useMemo(() => runDetectors(prose), [prose]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Header onBack={onBack} />

      {loading && <p className="text-text-muted font-sans">Carregando auditoria…</p>}
      {loadError && <p className="text-danger font-sans">{loadError}</p>}

      {!loading && !loadError && (
        <>
          <ActionPlanSection actionPlan={report.actionPlan} />
          {AXIS_ORDER.map((axis) => (
            <AxisSection
              key={axis}
              axis={axis}
              findings={report.findings.filter((f) => f.axis === axis)}
            />
          ))}
          <DetectorsSection prose={prose} alerts={detectorAlerts} />
        </>
      )}
    </div>
  );
}

function runDetectors(prose: string): DetectorAlert[] {
  return DETECTORS.flatMap((detector) => detector.detect(prose));
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <header className="flex items-center gap-4">
      <button
        onClick={onBack}
        className="px-3 py-1.5 text-sm font-sans border border-border-default rounded-lg text-text-muted hover:bg-bg-hover transition-colors cursor-pointer active:scale-[0.98]"
      >
        &larr; Voltar
      </button>
      <div>
        <h1 className="text-2xl font-serif font-bold text-text-main">Auditoria Bad Cop</h1>
        <p className="text-sm font-sans text-text-muted">
          Relatório informativo e não bloqueante — aponta pontos de atenção, mas nunca impede a
          escrita.
        </p>
      </div>
    </header>
  );
}

function ActionPlanSection({ actionPlan }: { actionPlan: string[] }) {
  return (
    <section className="p-4 rounded-xl bg-bg-surface border border-border-subtle space-y-2">
      <h2 className="text-sm font-serif font-bold text-text-main">Plano de Ação</h2>
      {actionPlan.length === 0 ? (
        <p className="text-sm font-sans text-text-muted">
          Nenhum problema macro foi priorizado — o texto está limpo nos três principais critérios.
        </p>
      ) : (
        <ul className="space-y-1">
          {actionPlan.map((item, i) => (
            <li key={i} className="text-sm font-sans text-text-main">
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AxisSection({ axis, findings }: { axis: AuditAxis; findings: AuditFinding[] }) {
  return (
    <section className="p-4 rounded-xl bg-bg-surface border border-border-subtle space-y-2">
      <h2 className="text-sm font-serif font-bold text-text-main">{AXIS_LABELS[axis]}</h2>
      {findings.length === 0 ? (
        <p className="text-sm font-sans text-text-muted">
          Nenhum problema detectado neste eixo.
        </p>
      ) : (
        <ol className="space-y-1 list-decimal list-inside">
          {findings.map((finding, i) => (
            <li
              key={i}
              className={`text-sm font-sans ${
                finding.severity === "warning" ? "text-danger" : "text-text-muted"
              }`}
            >
              {finding.message}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function DetectorsSection({ prose, alerts }: { prose: string; alerts: DetectorAlert[] }) {
  return (
    <section className="p-4 rounded-xl bg-bg-surface border border-border-subtle space-y-2">
      <h2 className="text-sm font-serif font-bold text-text-main">
        Detectores heurísticos (background)
      </h2>
      {!prose.trim() ? (
        <p className="text-sm font-sans text-text-muted">
          Ainda não há rascunho de prosa salvo para este livro — nada para analisar aqui.
        </p>
      ) : alerts.length === 0 ? (
        <p className="text-sm font-sans text-text-muted">
          Nenhum alerta heurístico encontrado no rascunho atual.
        </p>
      ) : (
        <ul className="space-y-1">
          {alerts.map((alert, i) => (
            <li
              key={i}
              className={`text-sm font-sans ${
                alert.level === "laranja" ? "text-danger" : "text-accent"
              }`}
            >
              <span className="font-mono text-[10px] tracking-widest uppercase mr-2">
                {alert.level}
              </span>
              {alert.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
