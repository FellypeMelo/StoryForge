import React, { ReactNode } from "react";
import { 
  BookOpen, 
  Users, 
  Layout, 
  Settings, 
  ShieldCheck, 
  Home,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface AppShellProps {
  children: ReactNode;
  appVersion?: string;
  dbHealthy?: boolean;
}

const NavItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
    active 
      ? "bg-blue-600/20 text-blue-400" 
      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
  }`}>
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

export const AppShell: React.FC<AppShellProps> = ({ children, appVersion, dbHealthy }) => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-64"} border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out bg-slate-900/50 backdrop-blur-xl`}>
        <div className="p-4 flex items-center justify-between">
          {!collapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              StoryForge
            </span>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          <NavItem icon={Home} label={collapsed ? "" : "Dashboard"} active />
          <NavItem icon={BookOpen} label={collapsed ? "" : "Story Bible"} />
          <NavItem icon={Users} label={collapsed ? "" : "Characters"} />
          <NavItem icon={Layout} label={collapsed ? "" : "Structure"} />
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-1">
          <NavItem icon={ShieldCheck} label={collapsed ? "" : "DevSecOps"} />
          <NavItem icon={Settings} label={collapsed ? "" : "Settings"} />
          
          {!collapsed && (
            <div className="mt-4 px-3 py-2 bg-slate-900/80 rounded-lg border border-slate-800/50">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                <span>System</span>
                <span className={dbHealthy ? "text-green-500" : "text-yellow-500"}>
                  {dbHealthy ? "Online" : "Syncing"}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                v{appVersion || "0.0.0"}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="max-w-5xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
