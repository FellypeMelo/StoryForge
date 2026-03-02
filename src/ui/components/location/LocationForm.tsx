import { useState } from "react";
import { Location, LocationProps } from "../../../domain/location";
import { Save, X, MapPin } from "lucide-react";

interface LocationFormProps {
  location: Location;
  onSave: (location: Location) => void;
  onCancel: () => void;
}

export function LocationForm({ location, onSave, onCancel }: LocationFormProps) {
  const [formData, setFormData] = useState<LocationProps>(location.toProps());
  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "name" && value.trim() !== "") {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrors({ name: "Nome é obrigatório" });
      return;
    }
    onSave(Location.create(formData));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center sticky top-0 bg-bg-base/80 backdrop-blur-md py-4 z-20 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="p-2 hover:bg-bg-hover rounded-full cursor-pointer"><X size={20} /></button>
          <h2 className="text-xl font-serif text-text-main">Detalhes do Local</h2>
        </div>
        <button type="submit" className="flex items-center gap-2 bg-text-main text-bg-base px-6 py-2 rounded font-sans font-bold text-sm hover:opacity-90 cursor-pointer">
          <Save size={16} /> Salvar Local
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 text-text-muted">
          <MapPin size={18} />
          <h3 className="text-xs font-bold tracking-widest uppercase">Informações do Cenário</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-medium text-text-muted">Nome</label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className={`w-full bg-bg-hover border ${errors.name ? "border-red-500" : "border-border-subtle"} p-3 rounded text-text-main focus:border-text-main outline-none`} />
            {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-xs font-medium text-text-muted">Descrição</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-bg-hover border border-border-subtle p-3 rounded text-text-main focus:border-text-main outline-none resize-none" />
          </div>
          <div className="space-y-2">
            <label htmlFor="symbolicMeaning" className="text-xs font-medium text-text-muted">Significado Simbólico</label>
            <input id="symbolicMeaning" name="symbolicMeaning" type="text" value={formData.symbolicMeaning} onChange={handleChange} className="w-full bg-bg-hover border border-border-subtle p-3 rounded text-text-main focus:border-text-main outline-none" placeholder="O que este lugar representa?" />
          </div>
        </div>
      </div>
    </form>
  );
}


