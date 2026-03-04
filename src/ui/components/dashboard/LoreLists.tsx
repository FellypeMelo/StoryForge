import { TimelineEvent } from "../../../domain/timeline-event";
import { Relationship } from "../../../domain/relationship";
import { BlacklistEntry } from "../../../domain/blacklist-entry";
import { Clock, GitBranch, Ban, ShieldQuestion } from "lucide-react";

interface TimelineListProps {
  events: TimelineEvent[];
  onSelect?: (event: TimelineEvent) => void;
  onCreateNew?: () => void;
}

export function TimelineList({ events, onSelect, onCreateNew }: TimelineListProps) {
  if (events.length === 0) {
    return (
      <div className="py-20 border-2 border-dashed border-border-subtle rounded-xl flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-4 bg-bg-hover rounded-full text-text-muted">
          <ShieldQuestion size={40} strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-serif text-text-main">Nenhum evento encontrado</h3>
          <p className="text-text-muted max-w-xs mx-auto">Mapeie a história do seu mundo.</p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-text-main text-bg-base px-6 py-2.5 rounded font-sans font-bold text-sm hover:opacity-90 cursor-pointer"
        >
          Adicionar Evento
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest uppercase text-text-muted">
          Linha do Tempo ({events.length})
        </h2>
        <button
          onClick={onCreateNew}
          className="text-xs font-bold tracking-widest uppercase text-text-main hover:underline cursor-pointer"
        >
          + Adicionar Novo
        </button>
      </div>
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id.value}
            onClick={() => onSelect?.(event)}
            className="group bg-bg-base border border-border-subtle p-6 rounded-lg flex gap-6 hover:border-text-main transition-all cursor-pointer relative"
          >
            {!event.bookId && (
              <span className="absolute top-4 right-4 text-[9px] font-bold tracking-widest uppercase text-purple-500 px-1.5 py-0.5 bg-purple-500/10 rounded">
                Universo
              </span>
            )}
            <div className="text-text-muted group-hover:text-text-main transition-colors mt-1">
              <Clock size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-text-main pr-16">
                {event.date || "Data Desconhecida"}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RelationshipListProps {
  relationships: Relationship[];
  onSelect?: (rel: Relationship) => void;
  onCreateNew?: () => void;
}

export function RelationshipList({ relationships, onSelect, onCreateNew }: RelationshipListProps) {
  if (relationships.length === 0) {
    return (
      <div className="py-20 border-2 border-dashed border-border-subtle rounded-xl flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-4 bg-bg-hover rounded-full text-text-muted">
          <ShieldQuestion size={40} strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-serif text-text-main">Nenhum relacionamento encontrado</h3>
          <p className="text-text-muted max-w-xs mx-auto">Conecte seus personagens.</p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-text-main text-bg-base px-6 py-2.5 rounded font-sans font-bold text-sm hover:opacity-90 cursor-pointer"
        >
          Adicionar Relacionamento
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest uppercase text-text-muted">
          Relacionamentos ({relationships.length})
        </h2>
        <button
          onClick={onCreateNew}
          className="text-xs font-bold tracking-widest uppercase text-text-main hover:underline cursor-pointer"
        >
          + Adicionar Novo
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relationships.map((rel) => (
          <div
            key={rel.id.value}
            onClick={() => onSelect?.(rel)}
            className="bg-bg-hover/50 border border-border-subtle p-4 rounded-lg flex items-center gap-4 hover:border-text-main transition-all cursor-pointer relative"
          >
            <GitBranch size={18} className="text-text-muted shrink-0" />
            <span className="text-sm font-sans text-text-main flex-1">{rel.type}</span>
            {!rel.bookId && (
              <span className="text-[9px] font-bold tracking-widest uppercase text-purple-500 px-1.5 py-0.5 bg-purple-500/10 rounded">
                Universo
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface BlacklistListProps {
  entries: BlacklistEntry[];
  onSelect?: (entry: BlacklistEntry) => void;
  onCreateNew?: () => void;
}

export function BlacklistList({ entries, onSelect, onCreateNew }: BlacklistListProps) {
  if (entries.length === 0) {
    return (
      <div className="py-20 border-2 border-dashed border-border-subtle rounded-xl flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-4 bg-bg-hover rounded-full text-text-muted">
          <ShieldQuestion size={40} strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-serif text-text-main">Nenhuma entrada na lista negra</h3>
          <p className="text-text-muted max-w-xs mx-auto">Defina limites para sua prosa.</p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-text-main text-bg-base px-6 py-2.5 rounded font-sans font-bold text-sm hover:opacity-90 cursor-pointer"
        >
          Adicionar Entrada
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest uppercase text-text-muted">
          Lista Negra ({entries.length})
        </h2>
        <button
          onClick={onCreateNew}
          className="text-xs font-bold tracking-widest uppercase text-text-main hover:underline cursor-pointer"
        >
          + Adicionar Novo
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        {entries.map((entry) => (
          <div
            key={entry.id.value}
            onClick={() => onSelect?.(entry)}
            className="bg-bg-hover border border-red-500/20 px-4 py-2 rounded-md flex items-center gap-3 hover:border-red-500 transition-all cursor-pointer"
          >
            <Ban size={14} className="text-red-500" />
            <span className="text-sm font-mono text-text-main">{entry.term}</span>
            {!entry.bookId && (
              <span className="text-[9px] font-bold tracking-widest uppercase text-purple-500 px-1.5 py-0.5 bg-purple-500/10 rounded">
                Universo
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
