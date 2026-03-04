import { useState } from "react";
import { IdeationState } from "./IdeationWizard";
import { GeneratePremisesUseCase } from "../../../application/ideation/generate-premises";
import { CrossPollinationSeed } from "../../../domain/ideation/cross-pollination-seed";
import { Genre } from "../../../domain/value-objects/genre";
import { AcademicDiscipline } from "../../../domain/value-objects/academic-discipline";
import { ClicheBlacklist } from "../../../domain/ideation/cliche-blacklist";
import { DummyLlmPort } from "../../../infrastructure/llm/dummy-llm-port";

interface PremiseGenerationStepProps {
  state: IdeationState;
  updateState: (updates: Partial<IdeationState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DISCIPLINES = [
  "Biologia Marinha",
  "Física Quântica",
  "Sociologia Urbana",
  "Botânica",
  "Arqueologia",
  "Economia Comportamental",
  "Teoria dos Jogos",
  "Entomologia",
];

export function PremiseGenerationStep({
  state,
  updateState,
  onNext,
  onBack,
}: PremiseGenerationStepProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!state.discipline) return;
    setLoading(true);

    try {
      const llmPort = new DummyLlmPort();
      const useCase = new GeneratePremisesUseCase(llmPort);

      const seed = new CrossPollinationSeed(
        Genre.create(state.genre),
        AcademicDiscipline.create(state.discipline),
      );

      const blacklist = new ClicheBlacklist(Genre.create(state.genre), state.cliches);

      const premises = await useCase.execute(seed, blacklist);

      updateState({
        premises: premises.map((p) => ({
          protagonist: p.protagonist,
          incitingIncident: p.incitingIncident,
          antagonist: p.antagonist,
          stakes: p.stakes,
        })),
      });
    } catch (error) {
      console.error("Erro ao gerar premissas:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 w-full animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-serif text-text-main">Hibridização</h2>
        <p className="text-text-muted">
          Combine {state.genre} com uma disciplina acadêmica para criar algo novo.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {DISCIPLINES.map((d) => (
          <button
            key={d}
            onClick={() => updateState({ discipline: d })}
            className={`px-3 py-2 rounded border text-sm transition-all ${
              state.discipline === d
                ? "border-text-main bg-text-main text-bg-main shadow-md"
                : "border-border-subtle hover:border-text-muted text-text-muted"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={handleGenerate}
          disabled={!state.discipline || loading}
          className="bg-text-main text-bg-main px-12 py-4 rounded font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-bg-main border-t-transparent rounded-full animate-spin" />
              Gerando Premissas...
            </>
          ) : (
            "Gerar 3 Premissas Únicas"
          )}
        </button>
      </div>

      {state.premises.length > 0 && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
          {state.premises.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                updateState({ selectedPremiseIndex: i });
                onNext();
              }}
              className="text-left p-6 border border-border-subtle rounded-lg hover:border-text-main transition-all group hover:bg-bg-hover"
            >
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4 group-hover:text-text-main">
                Premissa {i + 1}
              </h4>
              <p className="text-sm text-text-main line-clamp-4 italic mb-4">
                "{p.incitingIncident}"
              </p>
              <div className="space-y-2">
                <p className="text-xs text-text-muted">
                  <strong>Protagonista:</strong> {p.protagonist}
                </p>
                <p className="text-xs text-text-muted">
                  <strong>Stakes:</strong> {p.stakes}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="pt-8 flex justify-start">
        <button
          onClick={onBack}
          className="text-text-muted hover:text-text-main text-sm transition-colors"
        >
          ← Voltar para Clichês
        </button>
      </div>
    </div>
  );
}
