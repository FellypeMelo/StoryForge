import { ReactNode, useState, useEffect } from "react";
import {
  LayoutDashboard,
  Lightbulb,
  Library,
  Milestone,
  ListTree,
  PenLine,
  ShieldAlert,
  Settings,
  Feather,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from "lucide-react";

interface AppShellProps {
  children: ReactNode;
  appVersion?: string;
  dbHealthy?: boolean;
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

interface NavEntry {
  icon: LucideIcon;
  label: string;
  path: string;
}

const PRIMARY_NAV: NavEntry[] = [
  { icon: LayoutDashboard, label: "Painel", path: "dashboard" },
  { icon: Lightbulb, label: "Ideação", path: "ideation" },
  { icon: Library, label: "Codex", path: "codex" },
  { icon: Milestone, label: "Estrutura", path: "structure" },
  { icon: ListTree, label: "Capítulos", path: "chapters" },
  { icon: PenLine, label: "Escrita", path: "write" },
  { icon: ShieldAlert, label: "Auditoria", path: "audit" },
];

function NavItem({
  icon: Icon,
  label,
  active,
  collapsed,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={`group relative w-full flex items-center gap-3.5 rounded-control py-2.5 transition-all duration-200 font-sans cursor-pointer active:scale-[0.99] ${
        collapsed ? "justify-center px-0" : "justify-start px-3"
      } ${
        active
          ? "bg-accent-soft text-accent font-semibold"
          : "text-text-muted hover:bg-bg-hover hover:text-text-main"
      }`}
    >
      <span
        aria-hidden
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-accent transition-all duration-200 ${
          active ? "h-5 opacity-100" : "h-0 opacity-0"
        }`}
      />
      <Icon
        size={18}
        strokeWidth={active ? 2.25 : 1.75}
        className="transition-transform duration-200 group-hover:scale-110"
        aria-hidden
      />
      {!collapsed && <span className="text-[13px] tracking-[0.01em]">{label}</span>}
    </button>
  );
}

export function AppShell({
  children,
  appVersion,
  dbHealthy,
  onNavigate,
  currentPath = "dashboard",
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handleToggle = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleToggle);
    return () => window.removeEventListener("keydown", handleToggle);
  }, []);

  // Soft focus-mode: dim chrome while the writer types, never below readable contrast.
  useEffect(() => {
    let timeoutId: number;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      setIsTyping(true);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setIsTyping(false), 2000);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="flex h-screen bg-bg-base text-text-main overflow-hidden transition-colors duration-300">
      <aside
        className={`${collapsed ? "w-20" : "w-64"} border-r border-border-subtle flex flex-col transition-all duration-500 ease-in-out bg-bg-spine z-10`}
        style={{ opacity: isTyping ? 0.55 : 1 }}
        onMouseEnter={() => setIsTyping(false)}
      >
        <div
          className={`h-[72px] flex items-center gap-3 font-sans ${collapsed ? "justify-center px-0" : "px-5"}`}
        >
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent"
          >
            <Feather size={18} strokeWidth={2} />
          </span>
          {!collapsed && (
            <span className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold tracking-tight text-text-main">
                StoryForge
              </span>
              <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-text-faint">
                Atelier
              </span>
            </span>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Recolher barra lateral"
              className="ml-auto p-1.5 rounded-control hover:bg-bg-hover text-text-faint hover:text-text-muted transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Expandir barra lateral"
            className="mx-auto mb-2 p-1.5 rounded-control hover:bg-bg-hover text-text-faint hover:text-text-muted transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        )}

        <nav
          className={`flex-1 space-y-1 mt-3 ${collapsed ? "px-3" : "px-3"}`}
          aria-label="Navegação principal"
        >
          {PRIMARY_NAV.map((entry) => (
            <NavItem
              key={entry.path}
              icon={entry.icon}
              label={entry.label}
              active={currentPath === entry.path}
              collapsed={collapsed}
              onClick={() => onNavigate?.(entry.path)}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-border-subtle space-y-1">
          <NavItem
            icon={Settings}
            label="Preferências"
            active={currentPath === "settings"}
            collapsed={collapsed}
            onClick={() => onNavigate?.("settings")}
          />

          {!collapsed && (
            <div className="mt-3 px-3 py-3 font-mono text-[10px] tracking-widest text-text-faint space-y-1.5">
              <div className="flex items-center justify-between">
                <span>BANCO</span>
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className={`h-1.5 w-1.5 rounded-full ${dbHealthy ? "bg-success" : "bg-danger"}`}
                  />
                  <span className={dbHealthy ? "text-success" : "text-danger"}>
                    {dbHealthy ? "OK" : "ERR"}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span>VERSÃO</span>
                <span className="text-text-muted">{appVersion || "0.0.0"}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto relative bg-bg-base">
        <div className="max-w-[860px] mx-auto p-10 md:p-16 transition-all duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
