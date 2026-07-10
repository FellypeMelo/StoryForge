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
      className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors font-sans cursor-pointer active:scale-[0.98] ${
        active
          ? "bg-accent-soft text-accent font-semibold"
          : "text-text-muted hover:bg-bg-hover hover:text-text-main"
      } ${collapsed ? "justify-center" : "justify-start"}`}
    >
      <Icon size={18} strokeWidth={active ? 2.25 : 1.75} aria-hidden />
      {!collapsed && <span className="text-[13px]">{label}</span>}
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
        className={`${collapsed ? "w-20" : "w-64"} border-r border-border-subtle flex flex-col transition-all duration-500 ease-in-out bg-bg-base z-10`}
        style={{ opacity: isTyping ? 0.55 : 1 }}
        onMouseEnter={() => setIsTyping(false)}
      >
        <div className="p-6 flex items-center justify-between font-sans">
          {!collapsed && (
            <span className="text-sm font-bold tracking-[0.15em] uppercase text-text-main">
              StoryForge
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
            className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted transition-colors mx-auto cursor-pointer"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6" aria-label="Navegação principal">
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

        <div className="p-4 border-t border-border-subtle space-y-1.5">
          <NavItem
            icon={Settings}
            label="Preferências"
            active={currentPath === "settings"}
            collapsed={collapsed}
            onClick={() => onNavigate?.("settings")}
          />

          {!collapsed && (
            <div className="mt-4 px-3 py-3 font-mono text-[10px] tracking-widest text-text-muted space-y-1">
              <div className="flex justify-between">
                <span>BANCO</span>
                <span className={dbHealthy ? "text-success" : "text-danger"}>
                  {dbHealthy ? "OK" : "ERR"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>VERSÃO</span>
                <span>{appVersion || "0.0.0"}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto relative">
        <div className="max-w-[860px] mx-auto p-10 md:p-16 transition-all duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
