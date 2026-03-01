import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppShell } from "./ui/components/AppShell";
import { CharacterGallery } from "./ui/components/CharacterGallery";
import { CharacterEditor } from "./ui/components/CharacterEditor";
import { Character } from "./domain/character";

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
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  // Initializing with a default project for now
  const activeProjectId = "project-1";

  const fetchCharacters = async () => {
    setIsLoading(true);
    try {
      const list = await invoke<Character[]>("list_characters", { projectId: activeProjectId });
      setCharacters(list);
    } catch (err) {
      console.error("Failed to fetch characters:", err);
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    if (currentPath === "personas") {
      fetchCharacters();
      setEditingCharacter(null); // Reset edit state when navigating back to gallery
    }
  }, [currentPath]);

  const handleCreateCharacter = async () => {
    try {
      const name = prompt("Enter character name:");
      if (!name) return;

      const newChar = await invoke<Character>("create_character", {
        projectId: activeProjectId,
        name,
      });
      setEditingCharacter(newChar);
    } catch (err) {
      console.error("Failed to create character:", err);
      alert("Failed to create character: " + err);
    }
  };

  const handleSaveCharacter = async (char: Character) => {
    try {
      await invoke("update_character", { character: char });
      setEditingCharacter(null);
      await fetchCharacters();
    } catch (err) {
      console.error("Failed to update character:", err);
      alert("Failed to update character: " + err);
    }
  };

  const renderContent = () => {
    switch (currentPath) {
      case "personas":
        if (editingCharacter) {
          return (
            <CharacterEditor
              character={editingCharacter}
              onSave={handleSaveCharacter}
              onCancel={() => setEditingCharacter(null)}
            />
          );
        }
        return (
          <div className="space-y-12 py-8">
            <header className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-serif text-text-main tracking-tight leading-tight">
                Personas
              </h1>
              <p className="text-text-muted text-xl max-w-2xl font-serif leading-relaxed">
                Manage your characters and their psychological depth.
              </p>
            </header>

            {isLoading ? (
              <div className="py-20 flex justify-center">
                <span className="text-text-muted font-mono animate-pulse">
                  Consulting the archives...
                </span>
              </div>
            ) : (
              <CharacterGallery
                characters={characters}
                onCreateNew={handleCreateCharacter}
                onSelect={(char) => setEditingCharacter(char)}
              />
            )}
          </div>
        );
      case "dashboard":
      default:
        return (
          <div className="space-y-16 py-8">
            <header className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-serif text-text-main tracking-tight leading-tight">
                Welcome to the Forge
              </h1>
              <p className="text-text-muted text-xl max-w-2xl font-serif leading-relaxed">
                This is your workspace. Here, you'll craft worlds, breathe life into characters, and
                weave intricate narratives.
              </p>
            </header>

            {error && (
              <div className="py-4 border-b border-border-subtle text-text-muted font-mono text-sm">
                <span className="font-bold">System Error:</span> {error}
              </div>
            )}

            <section className="grid grid-cols-1 md:grid-cols-2 gap-16 font-sans">
              <div className="space-y-6">
                <h3 className="text-text-main font-bold tracking-widest uppercase text-xs">
                  Project Status
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-border-subtle pb-2">
                    <span className="text-text-muted text-sm tracking-wide">
                      Database Connection
                    </span>
                    <span
                      className={`text-sm font-medium ${health?.database ? "text-text-main" : "text-text-muted opacity-50"}`}
                    >
                      {health ? (health.database ? "Synchronized" : "Offline") : "Checking..."}
                    </span>
                  </div>
                  <div className="flex justify-between items-end border-b border-border-subtle pb-2">
                    <span className="text-text-muted text-sm tracking-wide">Client Version</span>
                    <span className="text-text-main text-sm font-mono">
                      {appInfo?.version || "..."}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-text-main font-bold tracking-widest uppercase text-xs">
                  Quick Actions
                </h3>
                <div className="flex flex-col gap-3">
                  <button className="text-left bg-bg-hover hover:bg-border-subtle px-5 py-4 rounded transition-colors text-text-main font-medium text-sm flex items-center justify-between group cursor-pointer">
                    Begin a New Chapter
                    <span className="text-text-muted group-hover:text-text-main transition-colors font-serif">
                      →
                    </span>
                  </button>
                  <button
                    onClick={() => setCurrentPath("personas")}
                    className="text-left bg-transparent hover:bg-bg-hover px-5 py-4 rounded transition-colors text-text-muted hover:text-text-main font-medium text-sm flex items-center justify-between group cursor-pointer"
                  >
                    Develop a Character Profile
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
