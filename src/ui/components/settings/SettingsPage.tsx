import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useToast } from "../shared/Toast";
import { LocalStorageProviderConfigRepository } from "../../../infrastructure/local/local-storage-provider-config-repository";
import { ProviderConfig } from "../../../domain/ports/provider-config-repository";

interface SettingsPageProps {
  onBack: () => void;
  onProviderChange: () => void;
}

type RealProvider = "llamacpp" | "ollama" | "openai" | "anthropic" | "gemini";
type Choice = "dummy" | RealProvider;

interface ProviderMeta {
  id: RealProvider;
  label: string;
  ariaLabel: string;
  description: string;
  needsApiKey: boolean;
  needsBaseUrl: boolean;
  baseUrlRequired: boolean;
  baseUrlLabel: string;
  defaultBaseUrl: string;
  defaultModel: string;
}

const PROVIDERS: ProviderMeta[] = [
  {
    id: "llamacpp",
    label: "llama.cpp (servidor local)",
    ariaLabel: "llama.cpp (servidor local)",
    description:
      "Conecta a um servidor llama.cpp na sua máquina. Protegido por circuit breaker.",
    needsApiKey: false,
    needsBaseUrl: true,
    baseUrlRequired: true,
    baseUrlLabel: "URL do servidor",
    defaultBaseUrl: "http://localhost:8080",
    defaultModel: "local",
  },
  {
    id: "ollama",
    label: "Ollama (servidor local)",
    ariaLabel: "Ollama (servidor local)",
    description: "Conecta a um servidor Ollama local. Informe o modelo instalado.",
    needsApiKey: false,
    needsBaseUrl: true,
    baseUrlRequired: true,
    baseUrlLabel: "URL do servidor",
    defaultBaseUrl: "http://localhost:11434",
    defaultModel: "llama3",
  },
  {
    id: "openai",
    label: "OpenAI",
    ariaLabel: "OpenAI",
    description: "API da OpenAI ou qualquer servidor compatível. Requer chave de API.",
    needsApiKey: true,
    needsBaseUrl: true,
    baseUrlRequired: false,
    baseUrlLabel: "URL base (opcional)",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
  },
  {
    id: "anthropic",
    label: "Anthropic (Claude)",
    ariaLabel: "Anthropic (Claude)",
    description: "API de mensagens da Anthropic. Requer chave de API.",
    needsApiKey: true,
    needsBaseUrl: false,
    baseUrlRequired: false,
    baseUrlLabel: "URL base (opcional)",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-opus-4-8",
  },
  {
    id: "gemini",
    label: "Google Gemini",
    ariaLabel: "Google Gemini",
    description: "API Generative Language do Google. Requer chave de API.",
    needsApiKey: true,
    needsBaseUrl: false,
    baseUrlRequired: false,
    baseUrlLabel: "URL base (opcional)",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
    defaultModel: "gemini-2.0-flash",
  },
];

interface Draft {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const repo = new LocalStorageProviderConfigRepository();

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function emptyDrafts(): Record<RealProvider, Draft> {
  const out = {} as Record<RealProvider, Draft>;
  for (const p of PROVIDERS) {
    out[p.id] = { apiKey: "", baseUrl: p.defaultBaseUrl, model: p.defaultModel };
  }
  return out;
}

export function SettingsPage({ onBack, onProviderChange }: SettingsPageProps) {
  const { showToast } = useToast();
  const [choice, setChoice] = useState<Choice>("dummy");
  const [drafts, setDrafts] = useState<Record<RealProvider, Draft>>(emptyDrafts);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const all = await repo.listAll();
      if (!all.success) return;

      setDrafts((prev) => {
        const next = { ...prev };
        for (const cfg of all.data) {
          const meta = PROVIDERS.find((p) => p.id === cfg.providerId);
          if (!meta) continue;
          next[meta.id] = {
            apiKey: cfg.apiKey ?? "",
            baseUrl: cfg.baseUrl ?? meta.defaultBaseUrl,
            model: cfg.defaultModel || meta.defaultModel,
          };
        }
        return next;
      });

      const active = all.data.find((c) => c.isActive);
      if (active) setChoice(active.providerId as RealProvider);
    };
    load();
  }, []);

  const updateDraft = (id: RealProvider, patch: Partial<Draft>) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const validate = (meta: ProviderMeta, draft: Draft): string | null => {
    if (meta.needsApiKey && draft.apiKey.trim() === "") {
      return "Informe a chave de API.";
    }
    const url = draft.baseUrl.trim();
    if (meta.needsBaseUrl && meta.baseUrlRequired && !isValidUrl(url)) {
      return "URL inválida. Use o formato http://host:porta";
    }
    if (meta.needsBaseUrl && !meta.baseUrlRequired && url !== "" && !isValidUrl(url)) {
      return "URL inválida. Use o formato http://host:porta";
    }
    return null;
  };

  const handleSave = async () => {
    setFieldError(null);

    if (choice !== "dummy") {
      const meta = PROVIDERS.find((p) => p.id === choice)!;
      const err = validate(meta, drafts[choice]);
      if (err) {
        setFieldError(err);
        return;
      }
    }

    setSaving(true);
    let failed = false;
    for (const meta of PROVIDERS) {
      const draft = drafts[meta.id];
      const config: ProviderConfig = {
        providerId: meta.id,
        apiKey: draft.apiKey.trim() || undefined,
        baseUrl: draft.baseUrl.trim() || undefined,
        defaultModel: draft.model.trim() || meta.defaultModel,
        isActive: choice === meta.id,
      };
      const result = await repo.save(config);
      if (!result.success) failed = true;
    }
    setSaving(false);

    if (failed) {
      showToast("Falha ao salvar preferências", "error");
      return;
    }
    showToast("Preferências salvas");
    onProviderChange();
  };

  const selected = choice === "dummy" ? null : PROVIDERS.find((p) => p.id === choice)!;
  const selectedDraft = choice === "dummy" ? null : drafts[choice];

  return (
    <div className="py-8 space-y-10 font-sans animate-fade-in">
      <header className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-main transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} aria-hidden />
          Voltar ao Painel
        </button>
        <h1 className="text-4xl font-serif font-bold text-text-main tracking-tight">
          Preferências
        </h1>
      </header>

      <section className="space-y-6 max-w-xl">
        <div className="space-y-1">
          <h2 className="text-text-main font-bold tracking-widest uppercase text-xs">
            Provedor de IA
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Escolha o motor que alimenta a geração criativa. O modo simulado funciona offline
            com respostas de demonstração.
          </p>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 rounded-xl border border-border-subtle hover:bg-bg-hover transition-colors cursor-pointer has-[:checked]:border-border-default has-[:checked]:bg-accent-soft">
            <input
              type="radio"
              name="provider"
              checked={choice === "dummy"}
              onChange={() => setChoice("dummy")}
              className="mt-1 accent-[var(--sf-accent)]"
              aria-label="Simulado (offline)"
            />
            <span>
              <span className="block text-sm font-medium text-text-main">Simulado (offline)</span>
              <span className="block text-xs text-text-muted mt-1">
                Respostas de demonstração. Nenhuma conexão necessária.
              </span>
            </span>
          </label>

          {PROVIDERS.map((meta) => (
            <label
              key={meta.id}
              className="flex items-start gap-3 p-4 rounded-xl border border-border-subtle hover:bg-bg-hover transition-colors cursor-pointer has-[:checked]:border-border-default has-[:checked]:bg-accent-soft"
            >
              <input
                type="radio"
                name="provider"
                checked={choice === meta.id}
                onChange={() => {
                  setFieldError(null);
                  setChoice(meta.id);
                }}
                className="mt-1 accent-[var(--sf-accent)]"
                aria-label={meta.ariaLabel}
              />
              <span>
                <span className="block text-sm font-medium text-text-main">{meta.label}</span>
                <span className="block text-xs text-text-muted mt-1">{meta.description}</span>
              </span>
            </label>
          ))}
        </div>

        {selected && selectedDraft && (
          <div className="space-y-4 animate-fade-in">
            {selected.needsApiKey && (
              <div className="space-y-2">
                <label
                  htmlFor="provider-api-key"
                  className="block text-sm font-medium text-text-main"
                >
                  Chave de API
                </label>
                <input
                  id="provider-api-key"
                  type="password"
                  value={selectedDraft.apiKey}
                  onChange={(e) => updateDraft(selected.id, { apiKey: e.target.value })}
                  placeholder="sk-..."
                  autoComplete="off"
                  className="w-full px-4 py-2.5 rounded-lg bg-bg-surface border border-border-default text-text-main text-sm focus:border-accent transition-colors"
                />
              </div>
            )}

            {selected.needsBaseUrl && (
              <div className="space-y-2">
                <label
                  htmlFor="provider-base-url"
                  className="block text-sm font-medium text-text-main"
                >
                  {selected.baseUrlLabel}
                </label>
                <input
                  id="provider-base-url"
                  type="text"
                  value={selectedDraft.baseUrl}
                  onChange={(e) => updateDraft(selected.id, { baseUrl: e.target.value })}
                  placeholder={selected.defaultBaseUrl}
                  className="w-full px-4 py-2.5 rounded-lg bg-bg-surface border border-border-default text-text-main text-sm focus:border-accent transition-colors"
                />
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="provider-model"
                className="block text-sm font-medium text-text-main"
              >
                Modelo
              </label>
              <input
                id="provider-model"
                type="text"
                value={selectedDraft.model}
                onChange={(e) => updateDraft(selected.id, { model: e.target.value })}
                placeholder={selected.defaultModel}
                className="w-full px-4 py-2.5 rounded-lg bg-bg-surface border border-border-default text-text-main text-sm focus:border-accent transition-colors"
              />
            </div>

            {fieldError && <p className="text-sm text-danger">{fieldError}</p>}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-accent text-on-accent text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar preferências"}
        </button>
      </section>
    </div>
  );
}
