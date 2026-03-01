import { ReactNode, useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Layout,
  Settings,
  ShieldCheck,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AppShellProps {
  children: ReactNode;
  appVersion?: string;
  dbHealthy?: boolean;
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

function NavItem({ 
  icon: Icon, 
  label, 
  active = false, 
  collapsed = false,
  onClick
}: { 
  icon: any; 
  label: string; 
  active?: boolean; 
  collapsed?: boolean;
  onClick?: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-start gap-4 p-3 rounded-md transition-all duration-300 font-sans cursor-pointer ${
        active 
          ? "text-text-main font-bold tracking-wide" 
          : "text-text-muted hover:bg-bg-hover hover:text-text-main"
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
      {!collapsed && <span className="text-[13px]">{label}</span>}
    </button>
  );
}

export function AppShell({ 
  children, 
  appVersion, 
  dbHealthy,
  onNavigate,
  currentPath = 'dashboard'
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Sidebar toggle shortcut logic (Ctrl+B / Cmd+B)
  useEffect(() => {
    const handleToggle = (e: KeyboardEvent) => {
      // Check for Ctrl+B or Cmd+B
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setCollapsed((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleToggle);
    return () => {
      window.removeEventListener("keydown", handleToggle);
    };
  }, []);

  // Auto-dimming logic for flow state
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
      {/* Sidebar - Auto dims when typing rapidly */}
      <aside
        className={`${collapsed ? "w-20" : "w-64"} border-r border-border-subtle flex flex-col transition-all duration-500 ease-in-out bg-bg-base z-10`}
        style={{ opacity: isTyping ? 0.1 : 1.0 }}
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
            className="p-1.5 rounded hover:bg-bg-hover text-text-muted transition-colors mx-auto cursor-pointer"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          <NavItem
            icon={Home}
            label="Painel"
            active={currentPath === "dashboard"}
            collapsed={collapsed}
            onClick={() => onNavigate?.("dashboard")}
          />
          <NavItem
            icon={BookOpen}
            label="Manuscrito"
            active={currentPath === "manuscript"}
            collapsed={collapsed}
            onClick={() => onNavigate?.("manuscript")}
          />
          <NavItem
            icon={Users}
            label="Personagens"
            active={currentPath === "personas"}
            collapsed={collapsed}
            onClick={() => onNavigate?.("personas")}
          />
          <NavItem
            icon={Layout}
            label="Arquitetura"
            active={currentPath === "architecture"}
            collapsed={collapsed}
            onClick={() => onNavigate?.("architecture")}
          />
        </nav>

        <div className="p-4 border-t border-border-subtle space-y-2">
          <NavItem icon={ShieldCheck} label="Verificação" collapsed={collapsed} />
          <NavItem icon={Settings} label="Preferências" collapsed={collapsed} />

          {!collapsed && (
            <div className="mt-6 px-4 py-3 font-mono text-[10px] tracking-widest text-text-muted space-y-1">
              <div className="flex justify-between">
                <span>SYS</span>
                <span style={{ opacity: dbHealthy ? 1.0 : 0.5 }}>{dbHealthy ? "OK" : "ERR"}</span>
              </div>
              <div className="flex justify-between">
                <span>VER</span>
                <span>{appVersion || "0.0.0"}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="max-w-[720px] mx-auto p-12 md:p-24 transition-all duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};
