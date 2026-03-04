import { useState } from "react";
import { IdeationState } from "./IdeationWizard";
import { ValidatePremiseUseCase } from "../../../application/ideation/validate-premise";
import { WorldbuildingPipeline } from "../../../application/worldbuilding/worldbuilding-pipeline";
import { Premise as PremiseEntity } from "../../../domain/ideation/premise";
import { ProjectId } from "../../../domain/value-objects/project-id";
import { WorldRuleRepository } from "../../../domain/ports/world-rule-repository";
import { WorldRule } from "../../../domain/world-rule";
import { Result } from "../../../domain/result";
import { LlmPort } from "../../../domain/ideation/ports/llm-port";
import { invoke } from "@tauri-apps/api/core";

interface ValidationStepProps {
  state: IdeationState;
  updateState: (updates: Partial<IdeationState>) => void;
  onBack: () => void;
  onFinish: () => void;
  projectId: string;
  bookId: string;
}

// Adapter for WorldRuleRepository using Tauri
class TauriWorldRuleRepository implements Partial<WorldRuleRepository> {
  constructor(private readonly bookId: string) {}

  async save(rule: WorldRule): Promise<Result<void, any>> {
    try {
      const props = rule.toProps();
      await invoke("create_world_rule", {
        projectId: props.projectId.value,
        bookId: this.bookId,
        category: props.category,
        content: props.content,
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
    
    if (prompt.includes("analyze")) {
      return { 
        text: JSON.stringify({ 
          isValid: true, 
          reason: "Conflito central forte. A subversão do botânico mimetizando a voz da esposa cria uma carga emocional imediata e riscos claros." 
        }) 
      };
    }
    
    if (prompt.includes("Physics")) return { text: "Regras de física baseadas em ressonância sonora vegetal." };
    if (prompt.includes("Economy")) return { text: "Economia de troca de sementes de memória." };
    if (prompt.includes("Sociology")) return { text: "Sociedade organizada em clãs de jardineiros estelares." };
    if (prompt.includes("Zones")) return { text: "Conflitos entre tecnocratas e preservacionistas orgânicos." };

    return { text: "Mock response for worldbuilding step." };
  }
}

export function ValidationStep({ state, updateState, onBack, onFinish, projectId, bookId }: ValidationStepProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const selectedPremiseData = state.selectedPremiseIndex !== null ? state.premises[state.selectedPremiseIndex] : null;

  const handleValidate = async () => {
    if (!selectedPremiseData) return;
    setLoading(true);
    
    try {
      const llmPort = new DummyLlmPort();
      const useCase = new ValidatePremiseUseCase(llmPort);
      
      const premise = new PremiseEntity(
        selectedPremiseData.protagonist,
        selectedPremiseData.incitingIncident,
        selectedPremiseData.antagonist,
        selectedPremiseData.stakes
      );

      const result = await useCase.execute(premise);
      updateState({ validationResult: result });
    } catch (error) {
      console.error("Erro ao validar premissa:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndForgeWorld = async () => {
    if (!selectedPremiseData) return;
    setSaving(true);
    
    try {
      const llmPort = new DummyLlmPort();
      const worldRuleRepo = new TauriWorldRuleRepository(bookId) as WorldRuleRepository;
      const pipeline = new WorldbuildingPipeline(llmPort, worldRuleRepo);
      
      const premise = new PremiseEntity(
        selectedPremiseData.protagonist,
        selectedPremiseData.incitingIncident,
        selectedPremiseData.antagonist,
        selectedPremiseData.stakes
      );

      await pipeline.run(ProjectId.create(projectId), premise);
      onFinish();
    } catch (error) {
      console.error("Erro ao forjar mundo:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!selectedPremiseData) return null;

  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-serif text-text-main">Inversão e Validação</h2>
        <p className="text-text-muted">Vamos garantir que sua ideia tenha pernas para uma história épica.</p>
      </div>

      <div className="p-6 bg-bg-hover border border-border-subtle rounded-lg space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Premissa Selecionada</h3>
        <p className="text-xl font-serif text-text-main italic">"{selectedPremiseData.incitingIncident}"</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
          <div>
            <span className="text-xs font-bold text-text-muted block uppercase">Protagonista</span>
            <span className="text-sm">{selectedPremiseData.protagonist}</span>
          </div>
          <div>
            <span className="text-xs font-bold text-text-muted block uppercase">Antagonista</span>
            <span className="text-sm">{selectedPremiseData.antagonist}</span>
          </div>
          <div className="md:col-span-2">
            <span className="text-xs font-bold text-text-muted block uppercase">Stakes</span>
            <span className="text-sm">{selectedPremiseData.stakes}</span>
          </div>
        </div>
      </div>

      {!state.validationResult ? (
        <div className="flex justify-center">
          <button
            onClick={handleValidate}
            disabled={loading}
            className="bg-text-main text-bg-main px-12 py-4 rounded font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-bg-main border-t-transparent rounded-full animate-spin" />
                Validando Estrutura...
              </>
            ) : (
              "Validar Potencial Dramático"
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          <div className={`p-6 rounded-lg border ${state.validationResult.isValid ? "border-text-main bg-bg-main" : "border-red-500/50 bg-red-500/5"}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-2 h-2 rounded-full ${state.validationResult.isValid ? "bg-text-main" : "bg-red-500"}`} />
              <h4 className="font-bold uppercase tracking-tighter">Análise da Forja</h4>
            </div>
            <p className="text-sm leading-relaxed">{state.validationResult.reason}</p>
          </div>

          <div className="flex flex-col items-center space-y-4 pt-4">
            <button
              onClick={handleSaveAndForgeWorld}
              disabled={saving || !state.validationResult.isValid}
              className="w-full bg-text-main text-bg-main px-12 py-5 rounded font-bold hover:opacity-90 transition-all disabled:opacity-50 flex flex-col items-center"
            >
              {saving ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-bg-main border-t-transparent rounded-full animate-spin" />
                  <span>Construindo Mundo (CAD)...</span>
                </div>
              ) : (
                <>
                  <span>Aceitar e Forjar Universo</span>
                  <span className="text-[10px] uppercase tracking-widest opacity-60 font-sans mt-1">
                    Isso gerará as regras de Física, Economia e Sociedade
                  </span>
                </>
              )}
            </button>
            <p className="text-xs text-text-muted text-center max-w-xs">
              Ao aceitar, esta premissa será salva e o pipeline CAD será iniciado para detalhar seu mundo.
            </p>
          </div>
        </div>
      )}

      <div className="pt-8 flex justify-start">
        <button onClick={onBack} disabled={saving} className="text-text-muted hover:text-text-main text-sm transition-colors">
          ← Trocar Premissa
        </button>
      </div>
    </div>
  );
}
