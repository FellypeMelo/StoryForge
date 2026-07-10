import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useToast } from "../shared/Toast";
import { LocalStorageProviderConfigRepository } from "../../../infrastructure/local/local-storage-provider-config-repository";

interface SettingsPageProps {
  onBack: () => void;
  onProviderChange: () => void;
}

type ProviderChoice = "dummy" | "llamacpp";

const repo = new LocalStorageProviderConfigRepository();

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function SettingsPage({ onBack, onProviderChange }: SettingsPageProps) {
  const { showToast } = useToast();
  const [choice, setChoice] = useState<ProviderChoice>("dummy");
  const [baseUrl, setBaseUrl] = useState("http://localhost:8080");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const found = await repo.findByProvider("llamacpp");
      if (found.success && found.data?.isActive) {
        setChoice("llamacpp");
        setBaseUrl(found.data.baseUrl ?? "http://localhost:8080");
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setUrlError(null);
    if (choice === "llamacpp" && !isValidUrl(baseUrl)) {
      setUrlError("URL inválida. Use o formato http://host:porta");
      return;
    }

    setSaving(true);
    const result = await repo.save({
      providerId: "llamacpp",
      baseUrl,
      defaultModel: "local",
      isActive: choice === "llamacpp",
    });
    setSaving(false);

    if (!result.success) {
      showToast("Falha ao salvar preferências", "error");
      return;
    }
    showToast("Preferências salvas");
    onProviderChange();
  };

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

          <label className="flex items-start gap-3 p-4 rounded-xl border border-border-subtle hover:bg-bg-hover transition-colors cursor-pointer has-[:checked]:border-border-default has-[:checked]:bg-accent-soft">
            <input
              type="radio"
              name="provider"
              checked={choice === "llamacpp"}
              onChange={() => setChoice("llamacpp")}
              className="mt-1 accent-[var(--sf-accent)]"
              aria-label="llama.cpp (servidor local)"
            />
            <span>
              <span className="block text-sm font-medium text-text-main">
                llama.cpp (servidor local)
              </span>
              <span className="block text-xs text-text-muted mt-1">
                Conecta a um servidor llama.cpp rodando na sua máquina. Protegido por circuit
                breaker.
              </span>
            </span>
          </label>
        </div>

        {choice === "llamacpp" && (
          <div className="space-y-2 animate-fade-in">
            <label htmlFor="llama-url" className="block text-sm font-medium text-text-main">
              URL do servidor
            </label>
            <input
              id="llama-url"
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:8080"
              className="w-full px-4 py-2.5 rounded-lg bg-bg-surface border border-border-default text-text-main text-sm focus:border-accent transition-colors"
            />
            {urlError && <p className="text-sm text-danger">{urlError}</p>}
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
