import React, { useState } from "react";
import { Character, CharacterProps, OceanScores } from "../../../domain/character";
import { Save, X, User, Brain, ScrollText } from "lucide-react";

interface CharacterFormProps {
  character: Character;
  onSave: (character: Character) => void;
  onCancel: () => void;
}

export function CharacterForm({ 
  character, 
  onSave, 
  onCancel 
}: CharacterFormProps) {
  const [formData, setFormData] = useState<CharacterProps>(character.toProps());
  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "age") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user types
    if (name === "name" && value.trim() !== "") {
      setErrors((prev) => ({ ...prev, name: undefined }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrors({ name: "Nome é obrigatório" });
      return;
    }
    onSave(Character.create({
      ...formData,
      id: formData.id,
      projectId: formData.projectId
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
    <form
      onSubmit={handleSubmit}
      className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="flex justify-between items-center sticky top-0 bg-bg-base/80 backdrop-blur-md py-4 z-20 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-bg-hover rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-serif text-text-main">Editando Perfil</h2>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 bg-text-main text-bg-base px-6 py-2 rounded font-sans font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Save size={16} />
          Salvar Alterações
        </button>
      </div>

      {/* Core Attributes */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-text-muted">
          <User size={18} />
          <h3 className="text-xs font-bold tracking-widest uppercase">Atributos Principais</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="name" className="text-xs font-medium text-text-muted">
              Nome
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full bg-bg-hover border ${errors.name ? "border-red-500" : "border-border-subtle"} p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors`}
              placeholder="Nome do Personagem"
            />
            {errors.name && <p className="text-[10px] text-red-500 font-sans">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="age" className="text-xs font-medium text-text-muted">
              Idade
            </label>
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
            <label htmlFor="occupation" className="text-xs font-medium text-text-muted">
              Ocupação
            </label>
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
            <label htmlFor="physical_description" className="text-xs font-medium text-text-muted">
              Descrição Física
            </label>
            <textarea
              id="physical_description"
              name="physical_description"
              value={formData.physical_description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors resize-none"
              placeholder="Traços visuais, estilo, presença..."
            />
          </div>
        </div>
      </section>

      {/* Psychology (OCEAN) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-text-muted">
          <Brain size={18} />
          <h3 className="text-xs font-bold tracking-widest uppercase">
            Perfil Psicológico (OCEAN)
          </h3>
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
      </section>

      {/* Narrative Elements */}
      <section className="space-y-6 pb-12">
        <div className="flex items-center gap-3 text-text-muted">
          <ScrollText size={18} />
          <h3 className="text-xs font-bold tracking-widest uppercase">Núcleo Narrativo</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="goal" className="text-xs font-medium text-text-muted">
              Objetivo Concreto
            </label>
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
            <label htmlFor="motivation" className="text-xs font-medium text-text-muted">
              Motivação
            </label>
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
            <label htmlFor="internal_conflict" className="text-xs font-medium text-text-muted">
              Conflito Interno (A Ferida)
            </label>
            <textarea
              id="internal_conflict"
              name="internal_conflict"
              value={formData.internal_conflict}
              onChange={handleChange}
              rows={2}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors resize-none"
              placeholder="A força interna que os impede de avançar..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <label htmlFor="voice" className="text-xs font-medium text-text-muted">
                Voz e Dicção
              </label>
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
              <label htmlFor="mannerisms" className="text-xs font-medium text-text-muted">
                Maneirismos
              </label>
              <input
                id="mannerisms"
                name="mannerisms"
                type="text"
                value={formData.mannerisms}
                onChange={handleChange}
                className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
                placeholder="Peculiaridades físicas, atos inconscientes..."
              />
            </div>
          </div>
        </div>
      </section>
    </form>
  );
};
