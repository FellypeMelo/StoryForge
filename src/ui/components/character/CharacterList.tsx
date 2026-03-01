import { Character } from "../../../domain/character";
import { User, ShieldQuestion } from "lucide-react";

interface CharacterListProps {
  characters: Character[];
  onSelect?: (character: Character) => void;
  onCreateNew?: () => void;
  injectedIds?: string[];
}

export function CharacterList({ 
  characters, 
  onSelect,
  onCreateNew,
  injectedIds = []
}: CharacterListProps) {
  if (characters.length === 0) {
    return (
      <div className="py-20 border-2 border-dashed border-border-subtle rounded-xl flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-4 bg-bg-hover rounded-full text-text-muted">
          <ShieldQuestion size={40} strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-serif text-text-main">Nenhum personagem encontrado</h3>
          <p className="text-text-muted max-w-xs mx-auto">
            Sua história aguarda seu elenco. Crie seu primeiro personagem para começar.
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-text-main text-bg-base px-6 py-2.5 rounded font-sans font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
        >
          Criar Personagem
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest uppercase text-text-muted">
          Elenco de Personagens ({characters.length})
        </h2>
        <button
          onClick={onCreateNew}
          className="text-xs font-bold tracking-widest uppercase text-text-main hover:underline cursor-pointer"
        >
          + Adicionar Novo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((char) => {
          const isInjected = injectedIds.includes(char.id.value);
          return (
            <div
              key={char.id.value}
              onClick={() => onSelect?.(char)}
              className={`group bg-bg-base border ${isInjected ? "border-text-main shadow-lg shadow-text-main/5" : "border-border-subtle"} p-6 rounded-lg space-y-4 hover:border-text-main transition-all duration-300 cursor-pointer flex flex-col h-full`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded group-hover:bg-text-main group-hover:text-bg-base transition-colors duration-300 ${isInjected ? "bg-text-main text-bg-base" : "bg-bg-hover"}`}>
                  <User size={24} strokeWidth={1.5} />
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="text-[10px] font-mono tracking-tighter text-text-muted opacity-50 uppercase">
                    {char.id.value.slice(0, 8)}
                  </span>
                  {isInjected && (
                    <span className="text-[9px] font-bold tracking-widest uppercase text-text-main px-1.5 py-0.5 bg-text-main/10 rounded animate-pulse">
                      Injetado
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1 flex-1">
                <h3 className="text-lg font-serif text-text-main group-hover:tracking-tight transition-all duration-300">
                  {char.name}
                </h3>
                <p className="text-xs text-text-muted font-sans line-clamp-1">
                  {char.occupation || "Sem ocupação"}
                </p>
                <p className="text-[10px] text-text-muted italic mt-2 line-clamp-2 opacity-70 group-hover:opacity-100 transition-opacity">
                  {char.toSnapshot()}
                </p>
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted">
                  Idade {char.age}
                </span>
                <span className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity font-serif">
                  →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
