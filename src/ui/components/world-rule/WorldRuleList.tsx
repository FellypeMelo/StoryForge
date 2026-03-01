import { WorldRule } from "../../../domain/world-rule";
import { Scroll, ShieldQuestion } from "lucide-react";

interface WorldRuleListProps {
  rules: WorldRule[];
  onSelect?: (rule: WorldRule) => void;
  onCreateNew?: () => void;
  injectedIds?: string[];
}

export function WorldRuleList({ 
  rules, 
  onSelect,
  onCreateNew,
  injectedIds = []
}: WorldRuleListProps) {
  if (rules.length === 0) {
    return (
      <div className="py-20 border-2 border-dashed border-border-subtle rounded-xl flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-4 bg-bg-hover rounded-full text-text-muted">
          <ShieldQuestion size={40} strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-serif text-text-main">Nenhuma regra encontrada</h3>
          <p className="text-text-muted max-w-xs mx-auto">
            Defina as leis do seu mundo. Adicione sua primeira regra para começar.
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-text-main text-bg-base px-6 py-2.5 rounded font-sans font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
        >
          Criar Regra
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest uppercase text-text-muted">
          Regras do Mundo ({rules.length})
        </h2>
        <button
          onClick={onCreateNew}
          className="text-xs font-bold tracking-widest uppercase text-text-main hover:underline cursor-pointer"
        >
          + Adicionar Novo
        </button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => {
          const isInjected = injectedIds.includes(rule.id.value);
          return (
            <div
              key={rule.id.value}
              onClick={() => onSelect?.(rule)}
              className={`group bg-bg-base border ${isInjected ? "border-text-main shadow-lg shadow-text-main/5" : "border-border-subtle"} p-6 rounded-lg space-y-2 hover:border-text-main transition-all duration-300 cursor-pointer flex flex-col`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded transition-colors ${isInjected ? "bg-text-main text-bg-base" : "bg-bg-hover text-text-muted group-hover:text-text-main"}`}>
                    <Scroll size={18} />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted px-2 py-1 bg-bg-hover rounded">
                    {rule.category}
                  </span>
                  {isInjected && (
                    <span className="text-[9px] font-bold tracking-widest uppercase text-text-main px-1.5 py-0.5 bg-text-main/10 rounded animate-pulse">
                      Injetado
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono tracking-tighter text-text-muted opacity-50 uppercase">
                  {rule.id.value.slice(0, 8)}
                </span>
              </div>

              <p className="text-sm font-serif text-text-main leading-relaxed">
                {rule.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
