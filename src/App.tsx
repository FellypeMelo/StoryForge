import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppShell } from "./ui/components/layout/AppShell";
import { CharacterList } from "./ui/components/character/CharacterList";
import { CharacterForm } from "./ui/components/character/CharacterForm";
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
      const name = prompt("Digite o nome do personagem:");
      if (!name) return;

      const newChar = await invoke<Character>("create_character", {
        projectId: activeProjectId,
        name,
      });
      setEditingCharacter(newChar);
    } catch (err) {
      console.error("Failed to create character:", err);
      alert("Falha ao criar o personagem: " + err);
    }
  };

  const handleSaveCharacter = async (char: Character) => {
    try {
      await invoke("update_character", { character: char });
      setEditingCharacter(null);
      await fetchCharacters();
    } catch (err) {
      console.error("Failed to update character:", err);
      alert("Falha ao atualizar o personagem: " + err);
    }
  };

  const renderContent = () => {
    switch (currentPath) {
      case "personas":
        if (editingCharacter) {
          return (
            <CharacterForm
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
                Personagens
              </h1>
              <p className="text-text-muted text-xl max-w-2xl font-serif leading-relaxed">
                Gerencie seus personagens e a profundidade psicológica deles.
              </p>
            </header>

            {isLoading ? (
              <div className="py-20 flex justify-center">
                <span className="text-text-muted font-mono animate-pulse">
                  Consultando os arquivos...
                </span>
              </div>
            ) : (
              <CharacterList
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
                Bem-vindo à Forja
              </h1>
              <p className="text-text-muted text-xl max-w-2xl font-serif leading-relaxed">
                Este é o seu espaço de trabalho. Aqui, você forjará mundos, dará vida a personagens e
                tecerá narrativas intrincadas.
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
                  Status do Projeto
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-border-subtle pb-2">
                    <span className="text-text-muted text-sm tracking-wide">
                      Conexão com Banco de Dados
                    </span>
                    <span
                      className={`text-sm font-medium ${health?.database ? "text-text-main" : "text-text-muted opacity-50"}`}
                    >
                      {health ? (health.database ? "Sincronizado" : "Desconectado") : "Verificando..."}
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
                  <button className="text-left bg-bg-hover hover:bg-border-subtle px-5 py-4 rounded transition-colors text-text-main font-medium text-sm flex items-center justify-between group cursor-pointer">
                    Iniciar um Novo Capítulo
                    <span className="text-text-muted group-hover:text-text-main transition-colors font-serif">
                      →
                    </span>
                  </button>
                  <button
                    onClick={() => setCurrentPath("personas")}
                    className="text-left bg-transparent hover:bg-bg-hover px-5 py-4 rounded transition-colors text-text-muted hover:text-text-main font-medium text-sm flex items-center justify-between group cursor-pointer"
                  >
                    Desenvolver Perfil de Personagem
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
