import { useState } from "react";
import { Sparkles, ChevronRight, Brain, Loader2, X } from "lucide-react";
import { ProjectId } from "../../../domain/value-objects/project-id";
import { Premise } from "../../../domain/ideation/premise";
import { GenerateCharacterUseCase } from "../../../application/character/generate-character";
import { DummyLlmPort } from "../../../infrastructure/llm/dummy-llm-port";
import { Character } from "../../../domain/character";

const llmPort = new DummyLlmPort();

interface AIGeneratorWizardProps {
  projectId: string;
  onGenerated: (character: Character) => void;
  onCancel: () => void;
  repository: any; // CharacterRepository
}

export function AIGeneratorWizard({
  projectId,
  onGenerated,
  onCancel,
  repository,
}: AIGeneratorWizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Protagonista");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const useCase = new GenerateCharacterUseCase(llmPort, repository);

      const dummyPremise = new Premise(
        "Character focus",
        context || "Uma história em desenvolvimento",
        "Obstáculos",
        "Stakes",
      );

      const sheet = await useCase.execute(
        ProjectId.create(projectId),
        name || "Personagem Gerado",
        dummyPremise,
        role,
      );

      // Map Sheet to Character for the legacy UI
      const char = Character.create({
        id: sheet.id,
        projectId: sheet.projectId,
        name: sheet.name,
        hauge_wound: sheet.hauge?.wound || "",
        hauge_belief: sheet.hauge?.belief || "",
        hauge_fear: sheet.hauge?.fear || "",
        hauge_identity: sheet.hauge?.identity || "",
        hauge_essence: sheet.hauge?.essence || "",
        voice_sentence_length: sheet.voice.sentenceLength,
        voice_formality: sheet.voice.formality,
        voice_verbal_tics: JSON.stringify(sheet.voice.verbalTics),
        voice_evasion_mechanism: sheet.voice.evasionMechanism,
        physical_tells: JSON.stringify(sheet.tells.list),
        ocean_scores: {
          openness: mapScore(sheet.ocean.openness),
          conscientiousness: mapScore(sheet.ocean.conscientiousness),
          extraversion: mapScore(sheet.ocean.extraversion),
          agreeableness: mapScore(sheet.ocean.agreeableness),
          neuroticism: mapScore(sheet.ocean.neuroticism),
        },
      });

      onGenerated(char);
    } catch (error) {
      console.error("AI Generation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const mapScore = (s: string) => {
    if (s === "High") return 80;
    if (s === "Low") return 20;
    return 50;
  };

  return (
    <div className="space-y-8 p-8 bg-bg-base border border-border-subtle rounded-xl max-w-md mx-auto animate-in fade-in zoom-in duration-300 shadow-2xl shadow-purple-500/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-purple-500">
          <Sparkles size={24} />
          <h2 className="text-xl font-serif">Forjar com IA</h2>
        </div>
        <button onClick={onCancel} className="text-text-muted hover:text-text-main p-1">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-1">
        <div className="h-1 w-full bg-bg-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-500"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
        <p className="text-[10px] font-mono text-text-muted uppercase text-right">Passo {step}/2</p>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-text-muted tracking-widest">
              Nome do Personagem
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. Arthur, Elara, ou deixe em branco..."
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-text-muted tracking-widest">
              Papel Narrativo
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans outline-none focus:border-purple-500 appearance-none transition-colors"
            >
              <option>Protagonista</option>
              <option>Antagonista</option>
              <option>Mentor</option>
              <option>Alívio Cômico</option>
              <option>Interesse Amoroso</option>
              <option>Aliado</option>
            </select>
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white p-4 rounded font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
          >
            Próximo <ChevronRight size={16} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-text-muted tracking-widest">
              Contexto / Premissa
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Sobre o que é a história? Algum detalhe específico para este personagem?"
              rows={5}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans outline-none focus:border-purple-500 resize-none transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 p-4 border border-border-subtle rounded font-bold hover:bg-bg-hover transition-colors"
            >
              Voltar
            </button>
            <button
              disabled={loading}
              onClick={handleGenerate}
              className="flex-[2] flex items-center justify-center gap-2 bg-purple-600 text-white p-4 rounded font-bold hover:bg-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Brain size={18} />}
              Forjar Alma
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
