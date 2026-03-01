import React, { useState } from "react";
import { Character, CharacterProps, OceanScores } from "../../domain/character";
import { ChevronLeft, ChevronRight, Save, X, User, Brain, ScrollText } from "lucide-react";

interface CharacterWizardProps {
  character: Character;
  onSave: (character: Character) => void;
  onCancel: () => void;
}

export function CharacterWizard({
  character,
  onSave,
  onCancel
}: CharacterWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CharacterProps>(character.toProps());
  const [errors, setErrors] = useState<{ name?: string }>({});

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "age") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "name" && value.trim() !== "") {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "name" && value.trim() === "") {
      setErrors((prev) => ({ ...prev, name: "Nome é obrigatório" }));
    }
  };

  const handleOceanChange = (trait: keyof OceanScores, value: number) => {
    setFormData((prev) => ({
      ...prev,
      ocean_scores: {
        ...prev.ocean_scores,
        [trait]: value,
      },
    }));
  };

  const oceanTraits: { key: keyof OceanScores; label: string }[] = [
    { key: "openness", label: "Abertura" },
    { key: "conscientiousness", label: "Consciência" },
    { key: "extraversion", label: "Extroversão" },
    { key: "agreeableness", label: "Amabilidade" },
    { key: "neuroticism", label: "Neuroticismo" },
  ];

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-6 bg-bg-base border border-border-subtle rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-[90vh]">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border-subtle pb-4 sticky top-0 bg-bg-base/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-bg-hover rounded-full transition-colors cursor-pointer text-text-muted"
          >
            <X size={20} />
          </button>
          <div>
            <h2 className="text-xl font-serif text-text-main">Novo Personagem</h2>
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
              Passo {step} de 3
            </p>
          </div>
        </div>
        
        {step === 3 && (
          <button
            onClick={() => {
              if (!formData.name.trim()) {
                setErrors({ name: "Nome é obrigatório" });
                setStep(1);
                return;
              }
              onSave(Character.create(formData));
            }}
            className="flex items-center gap-2 bg-text-main text-bg-base px-6 py-2 rounded font-sans font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-text-main/10"
          >
            <Save size={16} />
            Finalizar Ficha
          </button>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[400px] py-4">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 text-text-muted">
              <User size={18} />
              <h3 className="text-xs font-bold tracking-widest uppercase">Atributos Principais</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label htmlFor="name" className="text-xs font-medium text-text-muted">Nome</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full bg-bg-hover border ${errors.name ? "border-red-500" : "border-border-subtle"} p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors`}
                  placeholder="Nome do Personagem"
                />
                {errors.name && <p className="text-[10px] text-red-500 font-sans">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="age" className="text-xs font-medium text-text-muted">Idade</label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
                />
              </div>
              <div className="md:col-span-3 space-y-2">
                <label htmlFor="occupation" className="text-xs font-medium text-text-muted">Ocupação</label>
                <input
                  id="occupation"
                  name="occupation"
                  type="text"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
                  placeholder="ex. Herói Relutante, Arquivista, Antigo Espião"
                />
              </div>
              <div className="md:col-span-3 space-y-2">
                <label htmlFor="physical_description" className="text-xs font-medium text-text-muted">Descrição Física</label>
                <textarea
                  id="physical_description"
                  name="physical_description"
                  value={formData.physical_description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors resize-none"
                  placeholder="Traços visuais, estilo, presença..."
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 text-text-muted">
              <Brain size={18} />
              <h3 className="text-xs font-bold tracking-widest uppercase">Perfil Psicológico (OCEAN)</h3>
            </div>

            <div className="space-y-8 bg-bg-hover/30 p-8 rounded-lg border border-border-subtle">
              {oceanTraits.map((trait) => (
                <div key={trait.key} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-serif text-text-main">{trait.label}</label>
                    <span className="text-xs font-mono text-text-muted">
                      {formData.ocean_scores[trait.key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.ocean_scores[trait.key]}
                    onChange={(e) => handleOceanChange(trait.key, parseInt(e.target.value))}
                    className="w-full accent-text-main cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 text-text-muted">
              <ScrollText size={18} />
              <h3 className="text-xs font-bold tracking-widest uppercase">Núcleo Narrativo</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="goal" className="text-xs font-medium text-text-muted">Objetivo Concreto</label>
                <input
                  id="goal"
                  name="goal"
                  type="text"
                  value={formData.goal}
                  onChange={handleChange}
                  className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
                  placeholder="O que eles querem agora?"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="motivation" className="text-xs font-medium text-text-muted">Motivação</label>
                <input
                  id="motivation"
                  name="motivation"
                  type="text"
                  value={formData.motivation}
                  onChange={handleChange}
                  className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
                  placeholder="Por que eles querem isso?"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="internal_conflict" className="text-xs font-medium text-text-muted">Conflito Interno</label>
                <textarea
                  id="internal_conflict"
                  name="internal_conflict"
                  value={formData.internal_conflict}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors resize-none"
                  placeholder="A força interna que os impede de avançar..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="voice" className="text-xs font-medium text-text-muted">Voz e Dicção</label>
                  <input
                    id="voice"
                    name="voice"
                    type="text"
                    value={formData.voice}
                    onChange={handleChange}
                    className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
                    placeholder="Como eles falam?"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="mannerisms" className="text-xs font-medium text-text-muted">Maneirismos</label>
                  <input
                    id="mannerisms"
                    name="mannerisms"
                    type="text"
                    value={formData.mannerisms}
                    onChange={handleChange}
                    className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
                    placeholder="Peculiaridades físicas..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-8 border-t border-border-subtle sticky bottom-0 bg-bg-base/95 backdrop-blur-sm z-10 pb-2">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className={`flex items-center gap-2 px-4 py-2 rounded font-sans text-sm transition-all ${
            step === 1 
              ? "text-text-muted/30 cursor-not-allowed" 
              : "text-text-main hover:bg-bg-hover cursor-pointer"
          }`}
        >
          <ChevronLeft size={16} />
          Voltar
        </button>

        <button
          onClick={nextStep}
          disabled={step === 3}
          className={`flex items-center gap-2 px-6 py-2 rounded font-sans font-bold text-sm transition-all ${
            step === 3 
              ? "text-text-muted/30 cursor-not-allowed" 
              : "bg-text-main text-bg-base hover:opacity-90 cursor-pointer shadow-md shadow-text-main/10"
          }`}
        >
          Próximo
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
