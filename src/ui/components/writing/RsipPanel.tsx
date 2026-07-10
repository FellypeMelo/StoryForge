export interface RsipResult {
  draft: string;
  critique: string;
  finalVersion: string;
}

interface RsipCardProps {
  title: string;
  titleClass: string;
  body: string;
}

function RsipCard({ title, titleClass, body }: RsipCardProps) {
  return (
    <div className="p-3 bg-bg-surface border border-border-subtle rounded-xl">
      <h3 className={`text-xs font-semibold uppercase tracking-wide mb-1 ${titleClass}`}>
        {title}
      </h3>
      <p className="text-xs font-serif leading-relaxed text-text-main">{body}</p>
    </div>
  );
}

export function RsipPanel({ result }: { result: RsipResult | null }) {
  if (!result) return null;
  return (
    <aside
      aria-label="Saída RSIP"
      className="w-80 border-l border-border-subtle p-4 space-y-4 overflow-y-auto"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        Saída RSIP
      </h2>
      <RsipCard title="Rascunho" titleClass="text-text-muted" body={result.draft} />
      <RsipCard title="Crítica" titleClass="text-danger" body={result.critique} />
      <RsipCard
        title="Versão Final"
        titleClass="text-success"
        body={result.finalVersion}
      />
    </aside>
  );
}
