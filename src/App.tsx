import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppShell } from "./ui/components/layout/AppShell";
import { CodexDashboard } from "./ui/components/dashboard/CodexDashboard";
import { ProjectSelector } from "./ui/components/project/ProjectSelector";
import { BookSelector } from "./ui/components/book/BookSelector";
import { IdeationWizard } from "./ui/components/ideation/IdeationWizard";
import StructurePage from "./ui/components/structure/StructurePage";
import ChaptersPage from "./ui/components/chapters/ChaptersPage";
import { WritingPage } from "./ui/components/writing/WritingPage";
import AuditPanel from "./ui/components/audit/AuditPanel";
import { SettingsPage } from "./ui/components/settings/SettingsPage";
import { DashboardHome } from "./ui/components/dashboard/DashboardHome";
import { LlmPort } from "./domain/ideation/ports/llm-port";
import { DummyLlmPort } from "./infrastructure/llm/dummy-llm-port";
import { createRoutedLlmPort } from "./infrastructure/llm/llm-port-factory";
import { LocalStorageProviderConfigRepository } from "./infrastructure/local/local-storage-provider-config-repository";

interface AppInfo {
  name: string;
  version: string;
}

interface HealthStatus {
  database: boolean;
}

const providerConfigRepo = new LocalStorageProviderConfigRepository();

export function App() {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("dashboard");
  const [llmPort, setLlmPort] = useState<LlmPort>(() => new DummyLlmPort());
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() =>
    localStorage.getItem("storyforge_last_project"),
  );
  const [selectedBookId, setSelectedBookId] = useState<string | null>(() =>
    localStorage.getItem("storyforge_last_book"),
  );

  const refreshLlmPort = useCallback(async () => {
    const all = await providerConfigRepo.listAll();
    setLlmPort(createRoutedLlmPort(all.success ? all.data : []));
  }, []);

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
    refreshLlmPort();
  }, [refreshLlmPort]);

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

  const backToDashboard = () => setCurrentPath("dashboard");

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
            onBack={backToDashboard}
          />
        );
      case "ideation":
        return (
          <IdeationWizard
            projectId={selectedProjectId}
            bookId={selectedBookId}
            onBack={backToDashboard}
            llmPort={llmPort}
          />
        );
      case "structure":
        return <StructurePage bookId={selectedBookId} onBack={backToDashboard} />;
      case "chapters":
        return (
          <ChaptersPage
            bookId={selectedBookId}
            onBack={backToDashboard}
            llmPort={llmPort}
          />
        );
      case "write":
        return (
          <WritingPage
            llmPort={llmPort}
            bookId={selectedBookId}
            projectId={selectedProjectId}
            onBack={backToDashboard}
          />
        );
      case "audit":
        return <AuditPanel bookId={selectedBookId} onBack={backToDashboard} />;
      case "settings":
        return <SettingsPage onBack={backToDashboard} onProviderChange={refreshLlmPort} />;
      case "dashboard":
      default:
        return (
          <DashboardHome
            appVersion={appInfo?.version}
            dbHealthy={health?.database}
            error={error}
            onNavigate={setCurrentPath}
            onSwitchUniverse={handleBackToProjects}
          />
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
