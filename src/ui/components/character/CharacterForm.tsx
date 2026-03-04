import React, { useState } from "react";
import { Character, CharacterProps, OceanScores } from "../../../domain/character";
import { Save, X, User, Brain, ScrollText, Target, ShieldAlert, Zap, Mic, Fingerprint, Plus, Trash2 } from "lucide-react";

interface CharacterFormProps {
  character: Character;
  onSave: (character: Character) => void;
  onCancel: () => void;
}

export function CharacterForm({ character, onSave, onCancel }: CharacterFormProps) {
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

  const handleListChange = (field: "physical_tells" | "voice_verbal_tics", index: number, value: string) => {
    setFormData((prev) => {
      const currentList = JSON.parse(prev[field] || "[]") as string[];
      const newList = [...currentList];
      newList[index] = value;
      return { ...prev, [field]: JSON.stringify(newList) };
    });
  };

  const addListItem = (field: "physical_tells" | "voice_verbal_tics") => {
    setFormData((prev) => {
      const currentList = JSON.parse(prev[field] || "[]") as string[];
      return { ...prev, [field]: JSON.stringify([...currentList, ""]) };
    });
  };

  const removeListItem = (field: "physical_tells" | "voice_verbal_tics", index: number) => {
    setFormData((prev) => {
      const currentList = JSON.parse(prev[field] || "[]") as string[];
      if (field === "physical_tells" && currentList.length <= 3) return prev; // min 3 requirement
      const newList = currentList.filter((_, i) => i !== index);
      return { ...prev, [field]: JSON.stringify(newList) };
    });
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

    try {
      onSave(
        Character.create({
          ...formData,
          id: formData.id,
          projectId: formData.projectId,
        }),
      );
    } catch (error) {
      console.error("Validation error:", error);
      if (error instanceof Error) {
        alert(`Erro de validação: ${error.message}`);
      }
    }
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

      {/* Michael Hauge's Character Arc */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-text-muted">
          <Target size={18} />
          <h3 className="text-xs font-bold tracking-widest uppercase">Arco de Michael Hauge</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="hauge_wound" className="text-xs font-medium text-text-muted flex items-center gap-2">
              <Zap size={12} className="text-amber-500" /> A Ferida (Wound)
            </label>
            <textarea
              id="hauge_wound"
              name="hauge_wound"
              value={formData.hauge_wound}
              onChange={handleChange}
              rows={2}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors resize-none"
              placeholder="O evento traumático do passado..."
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="hauge_belief" className="text-xs font-medium text-text-muted">
              Crença Limitante (Belief)
            </label>
            <input
              id="hauge_belief"
              name="hauge_belief"
              type="text"
              value={formData.hauge_belief}
              onChange={handleChange}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
              placeholder="A mentira em que acreditam"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="hauge_fear" className="text-xs font-medium text-text-muted flex items-center gap-2">
              <ShieldAlert size={12} className="text-red-500" /> O Medo (Fear)
            </label>
            <input
              id="hauge_fear"
              name="hauge_fear"
              type="text"
              value={formData.hauge_fear}
              onChange={handleChange}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
              placeholder="O que os impede de mudar"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="hauge_identity" className="text-xs font-medium text-text-muted">
              Identidade / Máscara (Identity)
            </label>
            <input
              id="hauge_identity"
              name="hauge_identity"
              type="text"
              value={formData.hauge_identity}
              onChange={handleChange}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
              placeholder="Como se protegem do mundo"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="hauge_essence" className="text-xs font-medium text-text-muted">
              Essência (Essence)
            </label>
            <input
              id="hauge_essence"
              name="hauge_essence"
              type="text"
              value={formData.hauge_essence}
              onChange={handleChange}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors border-dashed border-purple-500/30"
              placeholder="Quem são verdadeiramente por dentro"
            />
          </div>
        </div>
      </section>

      {/* Voice Profile */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-text-muted">
          <Mic size={18} />
          <h3 className="text-xs font-bold tracking-widest uppercase">Perfil de Voz e Dicção</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="voice_sentence_length" className="text-xs font-medium text-text-muted">
              Ritmo / Comprimento de Frase
            </label>
            <input
              id="voice_sentence_length"
              name="voice_sentence_length"
              type="text"
              value={formData.voice_sentence_length}
              onChange={handleChange}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
              placeholder="ex. Frases curtas e ríspidas"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="voice_formality" className="text-xs font-medium text-text-muted">
              Nível de Formalidade
            </label>
            <input
              id="voice_formality"
              name="voice_formality"
              type="text"
              value={formData.voice_formality}
              onChange={handleChange}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
              placeholder="ex. Arcaico, Gírias de rua, Acadêmico"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="voice_evasion_mechanism" className="text-xs font-medium text-text-muted">
              Mecanismo de Evasão
            </label>
            <input
              id="voice_evasion_mechanism"
              name="voice_evasion_mechanism"
              type="text"
              value={formData.voice_evasion_mechanism}
              onChange={handleChange}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
              placeholder="O que fazem quando não querem responder algo?"
            />
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-text-muted">Cacoetes Verbais (Tics)</label>
              <button
                type="button"
                onClick={() => addListItem("voice_verbal_tics")}
                className="text-[10px] flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Plus size={10} /> Adicionar Tic
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {JSON.parse(formData.voice_verbal_tics || "[]").map((tic: string, index: number) => (
                <div key={index} className="flex items-center gap-2 bg-bg-hover border border-border-subtle rounded px-2 py-1">
                  <input
                    value={tic}
                    onChange={(e) => handleListChange("voice_verbal_tics", index, e.target.value)}
                    className="bg-transparent outline-none text-xs font-sans text-text-main min-w-[80px]"
                    placeholder="Tic verbal..."
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem("voice_verbal_tics", index)}
                    className="text-text-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Physical Tells */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-text-muted">
          <Fingerprint size={18} />
          <h3 className="text-xs font-bold tracking-widest uppercase">Expressões Involuntárias (Physical Tells)</h3>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] text-text-muted italic">Mínimo de 3 comportamentos para um perfil completo.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {JSON.parse(formData.physical_tells || "[]").map((tell: string, index: number) => (
              <div key={index} className="relative group">
                <textarea
                  value={tell}
                  onChange={(e) => handleListChange("physical_tells", index, e.target.value)}
                  className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-xs text-text-main focus:border-text-main outline-none transition-colors resize-none"
                  rows={2}
                  placeholder={`Tell #${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeListItem("physical_tells", index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden"
                  disabled={JSON.parse(formData.physical_tells || "[]").length <= 3}
                >
                  <X size={8} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem("physical_tells")}
              className="flex flex-col items-center justify-center border border-dashed border-border-subtle rounded hover:bg-bg-hover transition-colors min-h-[60px]"
            >
              <Plus size={16} className="text-text-muted" />
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">Novo Tell</span>
            </button>
          </div>
        </div>
      </section>

      {/* Narrative Elements */}
      <section className="space-y-6 pb-12">
        <div className="flex items-center gap-3 text-text-muted">
          <ScrollText size={18} />
          <h3 className="text-xs font-bold tracking-widest uppercase">Objetivos e Motivação</h3>
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
        </div>
      </section>
    </form>
  );
}
