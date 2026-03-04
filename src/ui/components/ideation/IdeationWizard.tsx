import { useState } from "react";
import { ClicheExtractionStep } from "./ClicheExtractionStep";
import { PremiseGenerationStep } from "./PremiseGenerationStep";
import { ValidationStep } from "./ValidationStep";

interface IdeationWizardProps {
  projectId: string;
  bookId: string;
  onBack: () => void;
}

export type IdeationState = {
  genre: string;
  cliches: string[];
  discipline: string;
  premises: Array<{
    protagonist: string;
    incitingIncident: string;
    antagonist: string;
    stakes: string;
  }>;
  selectedPremiseIndex: number | null;
  validationResult: {
    isValid: boolean;
    reason: string;
  } | null;
};

export function IdeationWizard({ projectId, bookId, onBack }: IdeationWizardProps) {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<IdeationState>({
    genre: "",
    cliches: [],
    discipline: "",
    premises: [],
    selectedPremiseIndex: null,
    validationResult: null,
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const updateState = (updates: Partial<IdeationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-8 py-8 animate-in fade-in duration-500">
      <header className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-serif text-text-main tracking-tight">Forja de Ideias (CHI)</h1>
          <button 
            onClick={onBack}
            className="px-4 py-2 text-sm border border-border-default rounded text-text-muted hover:text-text-main transition-colors"
          >
            Sair
          </button>
        </div>
        <div className="flex gap-4">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-text-main" : "bg-border-subtle"}`}
            />
          ))}
        </div>
      </header>

      <div className="min-h-[500px] border border-border-subtle rounded-lg p-8">
        {step === 1 && (
          <ClicheExtractionStep 
            state={state} 
            updateState={updateState} 
            onNext={nextStep} 
            projectId={projectId}
          />
        )}
        
        {step === 2 && (
          <PremiseGenerationStep 
            state={state} 
            updateState={updateState} 
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {step === 3 && (
          <ValidationStep 
            state={state} 
            updateState={updateState} 
            onBack={prevStep} 
            onFinish={onBack}
            projectId={projectId}
            bookId={bookId}
          />
        )}      </div>
    </div>
  );
}
