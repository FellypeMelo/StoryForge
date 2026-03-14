import { useState } from "react";
import { TimelineEvent, TimelineEventProps } from "../../../domain/timeline-event";
import { Relationship, RelationshipProps } from "../../../domain/relationship";
import { BlacklistEntry, BlacklistEntryProps } from "../../../domain/blacklist-entry";
import { Character } from "../../../domain/character";
import { Save, X, Clock, GitBranch, Ban } from "lucide-react";

interface TimelineEventFormProps {
  event: TimelineEvent;
  onSave: (event: TimelineEvent) => void;
  onCancel: () => void;
}

export function TimelineEventForm({ event, onSave, onCancel }: TimelineEventFormProps) {
  const [formData, setFormData] = useState<TimelineEventProps>(event.toProps());
  const [errors, setErrors] = useState<{ description?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "description" && value.trim() !== "") {
      setErrors((prev) => ({ ...prev, description: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      setErrors({ description: "Descrição é obrigatória" });
      return;
    }
    onSave(TimelineEvent.create(formData));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center sticky top-0 bg-bg-base/80 backdrop-blur-md py-4 z-20 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="p-2 hover:bg-bg-hover rounded-full cursor-pointer">
            <X size={20} />
          </button>
          <h2 className="text-xl font-serif text-text-main">Evento da Linha do Tempo</h2>
        </div>
        <button type="submit" className="flex items-center gap-2 bg-text-main text-bg-base px-6 py-2 rounded font-sans font-bold text-sm hover:opacity-90 cursor-pointer">
          <Save size={16} /> Salvar Evento
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 text-text-muted">
          <Clock size={18} />
          <h3 className="text-xs font-bold tracking-widest uppercase">Cronologia</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="date" className="text-xs font-medium text-text-muted">Data / Época</label>
            <input
              id="date"
              name="date"
              type="text"
              value={formData.date}
              onChange={handleChange}
              placeholder="Ex: Ano 452 da Terceira Era, Primavera..."
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded text-text-main focus:border-text-main outline-none"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-xs font-medium text-text-muted">Descrição do Evento</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className={`w-full bg-bg-hover border ${errors.description ? "border-red-500" : "border-border-subtle"} p-3 rounded text-text-main focus:border-text-main outline-none resize-none`}
              placeholder="O que aconteceu neste momento crucial?"
            />
            {errors.description && <p className="text-[10px] text-red-500">{errors.description}</p>}
          </div>
        </div>
      </div>
    </form>
  );
}

interface RelationshipFormProps {
  relationship: Relationship;
  characters: Character[];
  onSave: (relationship: Relationship) => void;
  onCancel: () => void;
}

export function RelationshipForm({ relationship, characters, onSave, onCancel }: RelationshipFormProps) {
  const [formData, setFormData] = useState<RelationshipProps>(relationship.toProps());
  const [errors, setErrors] = useState<{ type?: string; sameCharacter?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "characterAId" || name === "characterBId") {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: { value } 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "type" && value.trim() !== "") {
      setErrors((prev) => ({ ...prev, type: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { type?: string; sameCharacter?: string } = {};
    
    if (!formData.type.trim()) {
      newErrors.type = "Tipo de relacionamento é obrigatório";
    }
    
    if (formData.characterAId.value === formData.characterBId.value) {
      newErrors.sameCharacter = "Selecione personagens diferentes";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(Relationship.create(formData));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center sticky top-0 bg-bg-base/80 backdrop-blur-md py-4 z-20 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="p-2 hover:bg-bg-hover rounded-full cursor-pointer">
            <X size={20} />
          </button>
          <h2 className="text-xl font-serif text-text-main">Relacionamento</h2>
        </div>
        <button type="submit" className="flex items-center gap-2 bg-text-main text-bg-base px-6 py-2 rounded font-sans font-bold text-sm hover:opacity-90 cursor-pointer">
          <Save size={16} /> Salvar Relacionamento
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 text-text-muted">
          <GitBranch size={18} />
          <h3 className="text-xs font-bold tracking-widest uppercase">Conexões</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="characterAId" className="text-xs font-medium text-text-muted">Personagem A</label>
              <select
                id="characterAId"
                name="characterAId"
                value={formData.characterAId.value}
                onChange={handleChange}
                className="w-full bg-bg-hover border border-border-subtle p-3 rounded text-text-main focus:border-text-main outline-none cursor-pointer"
              >
                {characters.length === 0 && <option value="">Nenhum personagem encontrado</option>}
                {characters.map(c => (
                  <option key={c.id.value} value={c.id.value}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="characterBId" className="text-xs font-medium text-text-muted">Personagem B</label>
              <select
                id="characterBId"
                name="characterBId"
                value={formData.characterBId.value}
                onChange={handleChange}
                className="w-full bg-bg-hover border border-border-subtle p-3 rounded text-text-main focus:border-text-main outline-none cursor-pointer"
              >
                {characters.length === 0 && <option value="">Nenhum personagem encontrado</option>}
                {characters.map(c => (
                  <option key={c.id.value} value={c.id.value}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          {errors.sameCharacter && <p className="text-[10px] text-red-500">{errors.sameCharacter}</p>}

          <div className="space-y-2">
            <label htmlFor="type" className="text-xs font-medium text-text-muted">Natureza do Vínculo</label>
            <input
              id="type"
              name="type"
              type="text"
              value={formData.type}
              onChange={handleChange}
              placeholder="Ex: Rivais de infância, Amantes proibidos, Mestre e Aprendiz..."
              className={`w-full bg-bg-hover border ${errors.type ? "border-red-500" : "border-border-subtle"} p-3 rounded text-text-main focus:border-text-main outline-none`}
            />
            {errors.type && <p className="text-[10px] text-red-500">{errors.type}</p>}
          </div>
        </div>
      </div>
    </form>
  );
}

interface BlacklistEntryFormProps {
  entry: BlacklistEntry;
  onSave: (entry: BlacklistEntry) => void;
  onCancel: () => void;
}

export function BlacklistEntryForm({ entry, onSave, onCancel }: BlacklistEntryFormProps) {
  const [formData, setFormData] = useState<BlacklistEntryProps>(entry.toProps());
  const [errors, setErrors] = useState<{ term?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "term" && value.trim() !== "") {
      setErrors((prev) => ({ ...prev, term: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.term.trim()) {
      setErrors({ term: "O termo é obrigatório" });
      return;
    }
    onSave(BlacklistEntry.create(formData));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center sticky top-0 bg-bg-base/80 backdrop-blur-md py-4 z-20 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="p-2 hover:bg-bg-hover rounded-full cursor-pointer">
            <X size={20} />
          </button>
          <h2 className="text-xl font-serif text-text-main">Entrada da Lista Negra</h2>
        </div>
        <button type="submit" className="flex items-center gap-2 bg-text-main text-bg-base px-6 py-2 rounded font-sans font-bold text-sm hover:opacity-90 cursor-pointer">
          <Save size={16} /> Salvar Entrada
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 text-text-muted">
          <Ban size={18} />
          <h3 className="text-xs font-bold tracking-widest uppercase">Termos Restritos</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="term" className="text-xs font-medium text-text-muted">Termo / Clichê</label>
              <input
                id="term"
                name="term"
                type="text"
                value={formData.term}
                onChange={handleChange}
                className={`w-full bg-bg-hover border ${errors.term ? "border-red-500" : "border-border-subtle"} p-3 rounded text-text-main focus:border-text-main outline-none`}
              />
              {errors.term && <p className="text-[10px] text-red-500">{errors.term}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-xs font-medium text-text-muted">Categoria</label>
              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                placeholder="Ex: Estilo, Trama, Mundo..."
                className="w-full bg-bg-hover border border-border-subtle p-3 rounded text-text-main focus:border-text-main outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="reason" className="text-xs font-medium text-text-muted">Motivo da Restrição</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={4}
              className="w-full bg-bg-hover border border-border-subtle p-3 rounded text-text-main focus:border-text-main outline-none resize-none"
              placeholder="Por que evitar este termo ou ideia?"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
