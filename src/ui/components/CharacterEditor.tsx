import React, { useState } from "react";
import { Character, OceanScores } from "../../domain/character";
import { Save, X, User, Brain, ScrollText } from "lucide-react";

interface CharacterEditorProps {
  character: Character;
  onSave: (character: Character) => void;
  onCancel: () => void;
}

export const CharacterEditor: React.FC<CharacterEditorProps> = ({
  character,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Character>({ ...character });
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
      setErrors({ name: "Name is required" });
      return;
    }
    onSave(formData);
  };

  const oceanTraits: { key: keyof OceanScores; label: string }[] = [
    { key: "openness", label: "Openness" },
    { key: "conscientiousness", label: "Conscientiousness" },
    { key: "extraversion", label: "Extraversion" },
    { key: "agreeableness", label: "Agreeableness" },
    { key: "neuroticism", label: "Neuroticism" },
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
          <h2 className="text-xl font-serif text-text-main">Editing Profile</h2>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 bg-text-main text-bg-base px-6 py-2 rounded font-sans font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>

      {/* Core Attributes */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-text-muted">
          <User size={18} />
          <h3 className="text-xs font-bold tracking-widest uppercase">Core Attributes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="name" className="text-xs font-medium text-text-muted">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full bg-bg-hover border ${errors.name ? "border-red-500" : "border-border-subtle"} p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors`}
              placeholder="Character Name"
            />
            {errors.name && <p className="text-[10px] text-red-500 font-sans">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="age" className="text-xs font-medium text-text-muted">
              Age
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
              Occupation
            </label>
            <input
              id="occupation"
              name="occupation"
              type="text"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
              placeholder="e.g. Reluctant Hero, Archivist, Former Spy"
            />
          </div>
          <div className="md:col-span-3 space-y-2">
            <label htmlFor="physical_description" className="text-xs font-medium text-text-muted">
              Physical Description
            </label>
            <textarea
              id="physical_description"
              name="physical_description"
              value={formData.physical_description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors resize-none"
              placeholder="Visual traits, style, presence..."
            />
          </div>
        </div>
      </section>

      {/* Psychology (OCEAN) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-text-muted">
          <Brain size={18} />
          <h3 className="text-xs font-bold tracking-widest uppercase">
            Psychological Profile (OCEAN)
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
          <h3 className="text-xs font-bold tracking-widest uppercase">Narrative Core</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="goal" className="text-xs font-medium text-text-muted">
              Concrete Goal
            </label>
            <input
              id="goal"
              name="goal"
              type="text"
              value={formData.goal}
              onChange={handleChange}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
              placeholder="What do they want right now?"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="motivation" className="text-xs font-medium text-text-muted">
              Motivation
            </label>
            <input
              id="motivation"
              name="motivation"
              type="text"
              value={formData.motivation}
              onChange={handleChange}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
              placeholder="Why do they want it?"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="internal_conflict" className="text-xs font-medium text-text-muted">
              Internal Conflict (The Wound)
            </label>
            <textarea
              id="internal_conflict"
              name="internal_conflict"
              value={formData.internal_conflict}
              onChange={handleChange}
              rows={2}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors resize-none"
              placeholder="The internal force holding them back..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <label htmlFor="voice" className="text-xs font-medium text-text-muted">
                Voice & Diction
              </label>
              <input
                id="voice"
                name="voice"
                type="text"
                value={formData.voice}
                onChange={handleChange}
                className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
                placeholder="How do they speak?"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="mannerisms" className="text-xs font-medium text-text-muted">
                Mannerisms
              </label>
              <input
                id="mannerisms"
                name="mannerisms"
                type="text"
                value={formData.mannerisms}
                onChange={handleChange}
                className="w-full bg-bg-hover border border-border-subtle p-3 rounded font-sans text-text-main focus:border-text-main outline-none transition-colors"
                placeholder="Physical quirks, unconscious acts..."
              />
            </div>
          </div>
        </div>
      </section>
    </form>
  );
};
