
import { Character } from "../../../domain/character";
import { OceanRadarChart } from "./OceanRadarChart";
import { User, Brain, Target, Volume2, Edit3, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";

interface CharacterDashboardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (id: string) => void;
}

export function CharacterDashboard({ character, onEdit, onDelete }: CharacterDashboardProps) {
  const isComplete = character.isComplete();
  const props = character.toProps();

  const verbalTics = JSON.parse(props.voice_verbal_tics || "[]");
  const physicalTells = JSON.parse(props.physical_tells || "[]");

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      {/* Action Header */}
      <div className="flex justify-between items-center sticky top-0 bg-bg-base/80 backdrop-blur-md py-4 z-20 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <div
            className={`p-2 rounded-lg ${isComplete ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"}`}
          >
            {isComplete ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
          </div>
          <div>
            <h2 className="text-2xl font-serif text-text-main">{props.name}</h2>
            <p className="text-xs text-text-muted uppercase tracking-widest">
              {isComplete ? "Ficha Completa" : "Rascunho em Desenvolvimento"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(character)}
            className="flex items-center gap-2 bg-text-main text-bg-base px-4 py-2 rounded font-sans font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Edit3 size={16} /> Editar
          </button>
          <button
            onClick={() => onDelete(character.id.value)}
            className="p-2 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Core & Hauge */}
        <div className="space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-text-muted">
              <User size={18} />
              <h3 className="text-xs font-bold tracking-widest uppercase">Fundamentos</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-text-main leading-relaxed">
                <span className="text-text-muted italic">
                  "{props.physical_description || "Nenhuma descrição física fornecida."}"
                </span>
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-muted block text-xs uppercase font-bold">Ocupação</span>
                  <span className="text-text-main">{props.occupation || "---"}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-xs uppercase font-bold">Idade</span>
                  <span className="text-text-main">{props.age} anos</span>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 text-text-muted">
              <Target size={18} />
              <h3 className="text-xs font-bold tracking-widest uppercase">Arco de Hauge</h3>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="p-4 bg-bg-hover rounded-lg border border-border-subtle">
                <span className="text-[10px] font-bold uppercase text-text-muted block mb-1">
                  A Ferida (Wound)
                </span>
                <p className="text-sm text-text-main">{props.hauge_wound || "Não definida"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-bg-hover rounded-lg border border-border-subtle">
                  <span className="text-[10px] font-bold uppercase text-text-muted block mb-1">
                    Medo
                  </span>
                  <p className="text-sm text-text-main">{props.hauge_fear || "---"}</p>
                </div>
                <div className="p-4 bg-bg-hover rounded-lg border border-border-subtle">
                  <span className="text-[10px] font-bold uppercase text-text-muted block mb-1">
                    Crença
                  </span>
                  <p className="text-sm text-text-main">{props.hauge_belief || "---"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 p-4 border border-dashed border-border-subtle rounded-lg text-center">
                  <span className="text-[10px] font-bold uppercase text-text-muted block mb-1">
                    Identidade
                  </span>
                  <span className="text-sm text-text-main font-serif italic">
                    {props.hauge_identity || "---"}
                  </span>
                </div>
                <div className="text-text-muted">vs</div>
                <div className="flex-1 p-4 border border-text-main/20 rounded-lg text-center bg-text-main/5">
                  <span className="text-[10px] font-bold uppercase text-text-main block mb-1">
                    Essência
                  </span>
                  <span className="text-sm text-text-main font-serif font-bold italic">
                    {props.hauge_essence || "---"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: OCEAN & Expression */}
        <div className="space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-text-muted">
              <Brain size={18} />
              <h3 className="text-xs font-bold tracking-widest uppercase">Perfil Psicológico</h3>
            </div>
            <div className="flex justify-center p-4 bg-bg-hover/30 rounded-xl border border-border-subtle">
              <OceanRadarChart scores={props.ocean_scores} size={300} />
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 text-text-muted">
              <Volume2 size={18} />
              <h3 className="text-xs font-bold tracking-widest uppercase">Voz e Presença</h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-muted block text-xs uppercase font-bold">Dicção</span>
                  <span className="text-text-main">{props.voice_formality || "---"}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-xs uppercase font-bold">Evasão</span>
                  <span className="text-text-main">{props.voice_evasion_mechanism || "---"}</span>
                </div>
              </div>

              {verbalTics.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-text-muted">
                    Tiques Verbais
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {verbalTics.map((tic: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-bg-hover rounded border border-border-subtle text-text-main italic"
                      >
                        "{tic}"
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {physicalTells.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-text-muted">
                    Physical Tells
                  </span>
                  <ul className="space-y-1">
                    {physicalTells.map((tell: string, i: number) => (
                      <li key={i} className="text-sm text-text-main flex items-center gap-2">
                        <div className="w-1 h-1 bg-text-muted rounded-full" /> {tell}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
