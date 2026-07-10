import { ProseHighlight } from "../../../application/writing/analyze-prose";

interface WritingSidebarProps {
  beatSummary: string;
  characterName: string;
  onBeatSummaryChange: (value: string) => void;
  onCharacterNameChange: (value: string) => void;
  highlights: ProseHighlight[];
}

const INPUT_CLASS =
  "w-full px-3 py-2 text-sm bg-bg-surface border border-border-subtle rounded-lg text-text-main placeholder:text-text-muted focus:outline-none focus:border-border-default transition-colors";

const SECTION_TITLE_CLASS =
  "text-xs font-semibold uppercase tracking-wide text-text-muted";

export function WritingSidebar({
  beatSummary,
  characterName,
  onBeatSummaryChange,
  onCharacterNameChange,
  highlights,
}: WritingSidebarProps) {
  return (
    <aside
      aria-label="Painel da cena"
      className="w-64 border-r border-border-subtle p-4 space-y-6 overflow-y-auto"
    >
      <section className="space-y-3">
        <h2 className={SECTION_TITLE_CLASS}>Cena</h2>
        <div className="space-y-1">
          <label htmlFor="beat-summary" className="text-xs text-text-muted">
            Beat da cena
          </label>
          <input
            id="beat-summary"
            value={beatSummary}
            onChange={(e) => onBeatSummaryChange(e.target.value)}
            placeholder="Ex.: Herói descobre a traição"
            className={INPUT_CLASS}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="character-name" className="text-xs text-text-muted">
            Personagem POV
          </label>
          <input
            id="character-name"
            value={characterName}
            onChange={(e) => onCharacterNameChange(e.target.value)}
            placeholder="Ex.: Aria"
            className={INPUT_CLASS}
          />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className={SECTION_TITLE_CLASS}>Beats</h2>
        <div className="p-3 bg-bg-surface border border-border-subtle rounded-xl text-xs">
          <p className="font-medium text-text-main">Nenhum beat definido</p>
          <p className="mt-1 text-text-muted">
            Defina os beats desta cena na página Estrutura.
          </p>
        </div>
      </section>

      {highlights.length > 0 && (
        <section className="space-y-2">
          <h2 className={SECTION_TITLE_CLASS}>Alertas</h2>
          {highlights.map((h, i) => (
            <div
              key={`${h.type}-${h.start}-${i}`}
              title={h.tooltip}
              className="p-2 bg-accent-soft border border-border-subtle rounded-lg text-xs"
            >
              <span className="font-semibold text-accent">{h.text}</span>
              <div className="text-text-muted mt-0.5">{h.category}</div>
            </div>
          ))}
        </section>
      )}
    </aside>
  );
}
