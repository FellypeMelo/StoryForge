import { useState } from "react";
import { WorldRule, WorldRuleProps } from "../../domain/world-rule";
import { Save, X, Scroll } from "lucide-react";

interface WorldRuleFormProps {
  rule: WorldRule;
  onSave: (rule: WorldRule) => void;
  onCancel: () => void;
}

export function WorldRuleForm({ rule, onSave, onCancel }: WorldRuleFormProps) {
  const [formData, setFormData] = useState<WorldRuleProps>(rule.toProps());
  const [errors, setErrors] = useState<{ content?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "hierarchy") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (name === "content" && value.trim() !== "") {
      setErrors((prev) => ({ ...prev, content: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      setErrors({ content: "Conteúdo é obrigatório" });
      return;
    }
    onSave(WorldRule.create(formData));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center sticky top-0 bg-bg-base/80 backdrop-blur-md py-4 z-20 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="p-2 hover:bg-bg-hover rounded-full cursor-pointer"><X size={20} /></button>
          <h2 className="text-xl font-serif text-text-main">Regra do Mundo</h2>
        </div>
        <button type="submit" className="flex items-center gap-2 bg-text-main text-bg-base px-6 py-2 rounded font-sans font-bold text-sm hover:opacity-90 cursor-pointer">
          <Save size={16} /> Salvar Regra
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 text-text-muted">
          <Scroll size={18} />
          <h3 className="text-xs font-bold tracking-widest uppercase">Doutrinas e Leis</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 space-y-2">
              <label htmlFor="category" className="text-xs font-medium text-text-muted">Categoria</label>
              <input id="category" name="category" type="text" value={formData.category} onChange={handleChange} className="w-full bg-bg-hover border border-border-subtle p-3 rounded text-text-main focus:border-text-main outline-none" />
            </div>
            <div className="space-y-2">
              <label htmlFor="hierarchy" className="text-xs font-medium text-text-muted">Hierarquia</label>
              <input id="hierarchy" name="hierarchy" type="number" value={formData.hierarchy} onChange={handleChange} className="w-full bg-bg-hover border border-border-subtle p-3 rounded text-text-main focus:border-text-main outline-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="content" className="text-xs font-medium text-text-muted">Conteúdo da Regra</label>
            <textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={6} className={`w-full bg-bg-hover border ${errors.content ? "border-red-500" : "border-border-subtle"} p-3 rounded text-text-main focus:border-text-main outline-none resize-none`} placeholder="Descreva a lei, regra mágica ou costume social..." />
            {errors.content && <p className="text-[10px] text-red-500">{errors.content}</p>}
          </div>
        </div>
      </div>
    </form>
  );
}
