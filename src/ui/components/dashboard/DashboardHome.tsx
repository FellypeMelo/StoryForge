import { Lightbulb, Library, Milestone, ListTree, PenLine, LucideIcon } from "lucide-react";

interface DashboardHomeProps {
  appVersion?: string;
  dbHealthy?: boolean;
  error?: string | null;
  onNavigate: (path: string) => void;
  onSwitchUniverse: () => void;
}

interface QuickAction {
  icon: LucideIcon;
  label: string;
  description: string;
  path: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: Lightbulb,
    label: "Gerador de Ideias (CHI)",
    description: "Subverta clichês e forje premissas originais.",
    path: "ideation",
  },
  {
    icon: Library,
    label: "Codex da História",
    description: "Personagens, locais, regras e linha do tempo.",
    path: "codex",
  },
  {
    icon: Milestone,
    label: "Estrutura Narrativa",
    description: "Beats, frameworks e arquitetura dramática.",
    path: "structure",
  },
  {
    icon: ListTree,
    label: "Capítulos",
    description: "Organize cenas e sequências do manuscrito.",
    path: "chapters",
  },
  {
    icon: PenLine,
    label: "Assistente de Escrita",
    description: "Escreva com guardrails anti-clichê e RSIP.",
    path: "write",
  },
];

export function DashboardHome({
  appVersion,
  dbHealthy,
  error,
  onNavigate,
  onSwitchUniverse,
}: DashboardHomeProps) {
  return (
    <div className="space-y-14 py-4 animate-fade-in">
      <header className="space-y-6">
        <div className="flex justify-between items-start gap-6 w-full">
          <h1 className="text-4xl md:text-5xl font-serif text-text-main tracking-tight leading-tight">
            Bem-vindo à Forja
          </h1>
          <button
            onClick={onSwitchUniverse}
            className="shrink-0 px-4 py-2 text-sm border border-border-default rounded-lg text-text-muted hover:text-text-main hover:bg-bg-hover transition-colors cursor-pointer active:scale-[0.98]"
          >
            Trocar Universo
          </button>
        </div>
        <p className="text-text-muted text-lg max-w-2xl font-serif leading-relaxed">
          Este é o seu espaço de trabalho. Aqui você forjará mundos, dará vida a personagens e
          tecerá narrativas intrincadas.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="px-4 py-3 rounded-xl border border-danger/40 bg-danger/5 text-danger font-mono text-sm"
        >
          <span className="font-bold">Erro no sistema:</span> {error}
        </div>
      )}

      <section className="space-y-5 font-sans">
        <h2 className="text-text-main font-bold tracking-widest uppercase text-xs">
          Ações rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.path}
              onClick={() => onNavigate(action.path)}
              className="group text-left p-5 rounded-xl border border-border-subtle hover:border-border-default hover:bg-bg-hover transition-colors cursor-pointer active:scale-[0.99] flex items-start gap-4"
            >
              <span className="shrink-0 mt-0.5 p-2 rounded-lg bg-accent-soft text-accent">
                <action.icon size={18} strokeWidth={1.75} aria-hidden />
              </span>
              <span className="space-y-1">
                <span className="block text-sm font-medium text-text-main">{action.label}</span>
                <span className="block text-xs text-text-muted leading-relaxed">
                  {action.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-5 font-sans">
        <h2 className="text-text-main font-bold tracking-widest uppercase text-xs">
          Status do sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
          <div className="flex justify-between items-end border-b border-border-subtle pb-2">
            <span className="text-text-muted text-sm">Conexão com banco de dados</span>
            <span
              className={`text-sm font-medium ${dbHealthy ? "text-success" : "text-danger"}`}
            >
              {dbHealthy === undefined
                ? "Verificando..."
                : dbHealthy
                  ? "Sincronizado"
                  : "Desconectado"}
            </span>
          </div>
          <div className="flex justify-between items-end border-b border-border-subtle pb-2">
            <span className="text-text-muted text-sm">Versão do cliente</span>
            <span className="text-text-main text-sm font-mono">{appVersion || "..."}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
