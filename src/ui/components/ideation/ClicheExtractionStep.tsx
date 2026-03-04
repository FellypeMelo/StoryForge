import { useState } from "react";
import { IdeationState } from "./IdeationWizard";
import { ExtractClichesUseCase } from "../../../application/ideation/extract-cliches";
import { Genre } from "../../../domain/value-objects/genre";
import { ProjectId } from "../../../domain/value-objects/project-id";
import { LlmPort } from "../../../domain/ideation/ports/llm-port";
import { BlacklistRepository } from "../../../domain/ports/blacklist-repository";
import { BlacklistEntry } from "../../../domain/blacklist-entry";
import { Result } from "../../../domain/result";
import { invoke } from "@tauri-apps/api/core";

interface ClicheExtractionStepProps {
  state: IdeationState;
  updateState: (updates: Partial<IdeationState>) => void;
  onNext: () => void;
  projectId: string;
}

const GENRES = ["Fantasia", "Ficção Científica", "Cyberpunk", "Terror", "Romance", "Policial", "Épico"];

// Adapter for BlacklistRepository using Tauri
class TauriBlacklistRepository implements Partial<BlacklistRepository> {
  async save(entry: BlacklistEntry): Promise<Result<void, any>> {
    try {
      const props = entry.toProps();
      await invoke("create_blacklist_entry", {
        projectId: props.projectId.value,
        term: props.term,
        category: props.category,
        reason: props.reason,
      });
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error as any };
    }
  }
}

// Dummy LLM Port for now (Mocking the AI response)
class DummyLlmPort implements LlmPort {
  async complete(prompt: string): Promise<{ text: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (prompt.includes("Fantasia")) {
      return { text: "O Escolhido, O Lorde das Trevas, Espada Mágica, Profecia Antiga, Mentor que Morre" };
    }
    if (prompt.includes("Ficção Científica")) {
      return { text: "IA Assassina, Império Galáctico, Viagem no Tempo, Alienígenas Hostis, Arma de Destruição em Massa" };
    }
    return { text: "Cliche 1, Cliche 2, Cliche 3, Cliche 4, Cliche 5" };
  }
}

export function ClicheExtractionStep({ state, updateState, onNext, projectId }: ClicheExtractionStepProps) {
  const [loading, setLoading] = useState(false);

  const handleExtract = async () => {
    if (!state.genre) return;
    setLoading(true);
    
    try {
      const llmPort = new DummyLlmPort();
      const blacklistRepo = new TauriBlacklistRepository() as BlacklistRepository;
      const useCase = new ExtractClichesUseCase(llmPort, blacklistRepo);
      
      const result = await useCase.execute(
        Genre.create(state.genre),
        ProjectId.create(projectId)
      );
      
      updateState({ 
        cliches: result.bannedTerms 
      });
    } catch (error) {
      console.error("Erro ao extrair clichês:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-serif text-text-main">Escolha seu Gênero</h2>
        <p className="text-text-muted">O primeiro passo para a originalidade é conhecer o comum.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => updateState({ genre: g })}
            className={`px-4 py-3 rounded border transition-all ${
              state.genre === g 
                ? "border-text-main bg-text-main text-bg-main shadow-lg" 
                : "border-border-subtle hover:border-text-muted text-text-muted"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {state.genre && (
        <div className="pt-8 flex flex-col items-center space-y-6">
          <button
            onClick={handleExtract}
            disabled={loading}
            className="bg-text-main text-bg-main px-12 py-4 rounded font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-bg-main border-t-transparent rounded-full animate-spin" />
                Extraindo Clichês...
              </>
            ) : (
              "Mapear Clichês"
            )}
          </button>

          {state.cliches.length > 0 && !loading && (
            <div className="w-full space-y-4 animate-in fade-in zoom-in duration-300">
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted text-center">
                Clichês Detectados (Para serem evitados/subvertidos)
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {state.cliches.map((c, i) => (
                  <span key={i} className="px-3 py-1 bg-bg-hover border border-border-subtle rounded text-sm text-text-main">
                    {c}
                  </span>
                ))}
              </div>
              <div className="pt-6 flex justify-center">
                <button
                  onClick={onNext}
                  className="text-text-main font-bold hover:underline underline-offset-8 transition-all"
                >
                  Continuar para Hibridização →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
