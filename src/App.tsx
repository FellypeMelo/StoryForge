import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppShell } from "./ui/components/layout/AppShell";
import { CodexDashboard } from "./ui/components/dashboard/CodexDashboard";
import { ProjectSelector } from "./ui/components/project/ProjectSelector";
import { BookSelector } from "./ui/components/book/BookSelector";
import { IdeationWizard } from "./ui/components/ideation/IdeationWizard";
import StructurePage from "./ui/components/structure/StructurePage";
import ChaptersPage from "./ui/components/chapters/ChaptersPage";

interface AppInfo {
  name: string;
  version: string;
}

interface HealthStatus {
  database: boolean;
}

export function App() {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() =>
    localStorage.getItem("storyforge_last_project"),
  );
  const [selectedBookId, setSelectedBookId] = useState<string | null>(() =>
    localStorage.getItem("storyforge_last_book"),
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const info = await invoke<AppInfo>("get_app_info");
        const healthStatus = await invoke<HealthStatus>("health_check");
        setAppInfo(info);
        setHealth(healthStatus);
      } catch (err) {
        console.error("Failed to fetch app data:", err);
        setError(String(err));
      }
    };

    fetchData();
  }, []);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    localStorage.setItem("storyforge_last_project", projectId);
    setSelectedBookId(null);
    localStorage.removeItem("storyforge_last_book");
  };

  const handleSelectBook = (bookId: string) => {
    setSelectedBookId(bookId);
    localStorage.setItem("storyforge_last_book", bookId);
    setCurrentPath("dashboard");
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
    localStorage.removeItem("storyforge_last_project");
    setSelectedBookId(null);
    localStorage.removeItem("storyforge_last_book");
  };

  const renderContent = () => {
    if (!selectedProjectId) {
      return <ProjectSelector onSelectProject={handleSelectProject} />;
    }

    if (!selectedBookId) {
      return (
        <BookSelector
          projectId={selectedProjectId}
          onSelectBook={handleSelectBook}
          onBack={handleBackToProjects}
        />
      );
    }

    switch (currentPath) {
      case "codex":
        return (
          <CodexDashboard
            projectId={selectedProjectId}
            bookId={selectedBookId}
            onBack={() => setCurrentPath("dashboard")}
          />
        );
      case "ideation":
        return (
          <IdeationWizard
            projectId={selectedProjectId}
            bookId={selectedBookId}
            onBack={() => setCurrentPath("dashboard")}
          />
        );
      case "structure":
        return (
          <StructurePage onBack={() => setCurrentPath("dashboard")} />
        );
      case "chapters":
        return (
          <ChaptersPage onBack={() => setCurrentPath("dashboard")} />
        );
      case "dashboard":
      default:
        return (
          <div className="space-y-16 py-8">
            <header className="space-y-6">
              <div className="flex justify-between items-center w-full">
                <h1 className="text-5xl md:text-6xl font-serif text-text-main tracking-tight leading-tight">
                  Bem-vindo à Forja
                </h1>
                <button
                  onClick={handleBackToProjects}
                  className="px-4 py-2 text-sm border border-border-default rounded text-text-muted hover:text-text-main hover:border-text-main transition-colors"
                >
                  Trocar Universo
                </button>
              </div>
              <p className="text-text-muted text-xl max-w-2xl font-serif leading-relaxed">
                Este é o seu espaço de trabalho. Aqui, você forjará mundos, dará vida a personagens
                e tecerá narrativas intrincadas.
              </p>
            </header>

            {error && (
              <div className="py-4 border-b border-border-subtle text-text-muted font-mono text-sm">
                <span className="font-bold">Erro no Sistema:</span> {error}
              </div>
            )}

            <section className="grid grid-cols-1 md:grid-cols-2 gap-16 font-sans">
              <div className="space-y-6">
                <h3 className="text-text-main font-bold tracking-widest uppercase text-xs">
                  Status do Sistema
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-border-subtle pb-2">
                    <span className="text-text-muted text-sm tracking-wide">
                      Conexão com Banco de Dados
                    </span>
                    <span
                      className={`text-sm font-medium ${health?.database ? "text-text-main" : "text-text-muted opacity-50"}`}
                    >
                      {health
                        ? health.database
                          ? "Sincronizado"
                          : "Desconectado"
                        : "Verificando..."}
                    </span>
                  </div>
                  <div className="flex justify-between items-end border-b border-border-subtle pb-2">
                    <span className="text-text-muted text-sm tracking-wide">Versão do Cliente</span>
                    <span className="text-text-main text-sm font-mono">
                      {appInfo?.version || "..."}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-text-main font-bold tracking-widest uppercase text-xs">
                  Ações Rápidas
                </h3>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {}}
                    className="text-left bg-bg-hover hover:bg-border-subtle px-5 py-4 rounded transition-colors text-text-main font-medium text-sm flex items-center justify-between group cursor-pointer"
                  >
                    Detalhes do Livro
                    <span className="text-text-muted group-hover:text-text-main transition-colors font-serif">
                      →
                    </span>
                  </button>
                  <button
                    onClick={() => setCurrentPath("ideation")}
                    className="text-left bg-transparent hover:bg-bg-hover border border-border-subtle hover:border-transparent px-5 py-4 rounded transition-all text-text-main font-medium text-sm flex items-center justify-between group cursor-pointer"
                  >
                    Gerador de Ideias (CHI)
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity font-serif">
                      →
                    </span>
                  </button>
                  <button
                    onClick={() => setCurrentPath("codex")}
                    className="text-left bg-transparent hover:bg-bg-hover border border-border-subtle hover:border-transparent px-5 py-4 rounded transition-all text-text-main font-medium text-sm flex items-center justify-between group cursor-pointer"
                  >
                    Codex da História (Lore)
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity font-serif">
                      →
                    </span>
                  </button>
                  <button
                    onClick={() => setCurrentPath("structure")}
                    className="text-left bg-transparent hover:bg-bg-hover border border-border-subtle hover:border-transparent px-5 py-4 rounded transition-all text-text-main font-medium text-sm flex items-center justify-between group cursor-pointer"
                  >
                    Estrutura Narrativa
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity font-serif">
                      →
                    </span>
                  </button>
                  <button
                    onClick={() => setCurrentPath("chapters")}
                    className="text-left bg-transparent hover:bg-bg-hover border border-border-subtle hover:border-transparent px-5 py-4 rounded transition-all text-text-main font-medium text-sm flex items-center justify-between group cursor-pointer"
                  >
                    Capítulos
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity font-serif">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <AppShell
      appVersion={appInfo?.version}
      dbHealthy={health?.database}
      onNavigate={setCurrentPath}
      currentPath={currentPath}
    >
      {renderContent()}
    </AppShell>
  );
}

export default App;
