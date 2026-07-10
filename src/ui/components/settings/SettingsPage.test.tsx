import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SettingsPage } from "./SettingsPage";
import { ToastProvider } from "../shared/Toast";
import { LocalStorageProviderConfigRepository } from "../../../infrastructure/local/local-storage-provider-config-repository";
import { LocalStorageEmbeddingConfigRepository } from "../../../infrastructure/local/local-storage-embedding-config-repository";

function renderPage(onBack = vi.fn(), onProviderChange = vi.fn()) {
  return render(
    <ToastProvider>
      <SettingsPage onBack={onBack} onProviderChange={onProviderChange} />
    </ToastProvider>,
  );
}

describe("SettingsPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renderiza opções de provedor", async () => {
    renderPage();
    expect(await screen.findByText(/Provedor de IA/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Simulado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/llama.cpp/i)).toBeInTheDocument();
  });

  it("simulado é o padrão quando nada configurado", async () => {
    renderPage();
    const dummyRadio = await screen.findByLabelText(/Simulado/i);
    expect(dummyRadio).toBeChecked();
  });

  it("selecionar llama.cpp exibe campo de URL", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText(/llama.cpp/i));
    expect(screen.getByLabelText(/URL do servidor/i)).toBeInTheDocument();
  });

  it("salvar persiste config e notifica mudança", async () => {
    const onProviderChange = vi.fn();
    renderPage(vi.fn(), onProviderChange);

    fireEvent.click(await screen.findByLabelText(/llama.cpp/i));
    fireEvent.change(screen.getByLabelText(/URL do servidor/i), {
      target: { value: "http://localhost:8080" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    await waitFor(async () => {
      const repo = new LocalStorageProviderConfigRepository();
      const found = await repo.findByProvider("llamacpp");
      if (!found.success) throw new Error("expected success");
      expect(found.data?.isActive).toBe(true);
      expect(found.data?.baseUrl).toBe("http://localhost:8080");
    });
    expect(onProviderChange).toHaveBeenCalled();
  });

  it("carrega config llamacpp existente ao abrir", async () => {
    const repo = new LocalStorageProviderConfigRepository();
    await repo.save({
      providerId: "llamacpp",
      baseUrl: "http://localhost:9191",
      defaultModel: "local",
      isActive: true,
    });

    renderPage();
    const radio = await screen.findByLabelText(/llama.cpp/i);
    await waitFor(() => expect(radio).toBeChecked());
    expect(screen.getByLabelText(/URL do servidor/i)).toHaveValue("http://localhost:9191");
  });

  it("URL inválida mostra erro e não salva", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText(/llama.cpp/i));
    fireEvent.change(screen.getByLabelText(/URL do servidor/i), {
      target: { value: "não é url" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    expect(await screen.findByText(/URL inválida/i)).toBeInTheDocument();
    const repo = new LocalStorageProviderConfigRepository();
    const found = await repo.findByProvider("llamacpp");
    if (!found.success) throw new Error("expected success");
    expect(found.data).toBeNull();
  });

  it("lista todos os provedores reais", async () => {
    renderPage();
    expect(await screen.findByLabelText(/Ollama/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/OpenAI/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Anthropic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gemini/i)).toBeInTheDocument();
  });

  it("selecionar OpenAI exibe campo de chave de API e modelo", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText(/OpenAI/i));
    expect(screen.getByLabelText("Chave de API")).toBeInTheDocument();
    expect(screen.getByLabelText("Modelo")).toBeInTheDocument();
  });

  it("chave de API vazia bloqueia salvar provedor de nuvem", async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText(/Anthropic/i));
    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    expect(await screen.findByText(/Informe a chave de API/i)).toBeInTheDocument();
    const repo = new LocalStorageProviderConfigRepository();
    const found = await repo.findByProvider("anthropic");
    if (!found.success) throw new Error("expected success");
    expect(found.data).toBeNull();
  });

  it("salva provedor OpenAI com chave e modelo", async () => {
    const onProviderChange = vi.fn();
    renderPage(vi.fn(), onProviderChange);

    fireEvent.click(await screen.findByLabelText(/OpenAI/i));
    fireEvent.change(screen.getByLabelText("Chave de API"), {
      target: { value: "sk-live-123" },
    });
    fireEvent.change(screen.getByLabelText("Modelo"), {
      target: { value: "gpt-4o" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    await waitFor(async () => {
      const repo = new LocalStorageProviderConfigRepository();
      const found = await repo.findByProvider("openai");
      if (!found.success) throw new Error("expected success");
      expect(found.data?.isActive).toBe(true);
      expect(found.data?.apiKey).toBe("sk-live-123");
      expect(found.data?.defaultModel).toBe("gpt-4o");
    });
    expect(onProviderChange).toHaveBeenCalled();
  });

  it("carrega provedor de nuvem ativo ao abrir", async () => {
    const repo = new LocalStorageProviderConfigRepository();
    await repo.save({
      providerId: "gemini",
      apiKey: "gk-existing",
      defaultModel: "gemini-2.0-flash",
      isActive: true,
    });

    renderPage();
    const radio = await screen.findByLabelText(/Gemini/i);
    await waitFor(() => expect(radio).toBeChecked());
    expect(screen.getByLabelText("Chave de API")).toHaveValue("gk-existing");
  });

  describe("embeddings (busca semântica)", () => {
    it("renderiza a seção de embeddings desabilitada por padrão", async () => {
      renderPage();
      expect(await screen.findByText(/Embeddings \(Busca Semântica\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Habilitar embeddings reais/i)).not.toBeChecked();
      expect(screen.queryByLabelText(/URL do servidor/i)).not.toBeInTheDocument();
    });

    it("habilitar exibe os campos de URL e modelo", async () => {
      renderPage();
      fireEvent.click(await screen.findByLabelText(/Habilitar embeddings reais/i));

      expect(screen.getByLabelText(/URL do servidor/i)).toBeInTheDocument();
      expect(screen.getByLabelText("Modelo")).toBeInTheDocument();
    });

    it("habilita embeddings reais e persiste a configuração ao salvar", async () => {
      const onProviderChange = vi.fn();
      renderPage(vi.fn(), onProviderChange);

      fireEvent.click(await screen.findByLabelText(/Habilitar embeddings reais/i));
      fireEvent.change(screen.getByLabelText(/URL do servidor/i), {
        target: { value: "http://127.0.0.1:8090" },
      });
      fireEvent.change(screen.getByLabelText("Modelo"), {
        target: { value: "nomic-embed-text" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

      await waitFor(async () => {
        const repo = new LocalStorageEmbeddingConfigRepository();
        const result = await repo.load();
        if (!result.success) throw new Error("expected success");
        expect(result.data.enabled).toBe(true);
        expect(result.data.baseUrl).toBe("http://127.0.0.1:8090");
        expect(result.data.model).toBe("nomic-embed-text");
      });
      expect(onProviderChange).toHaveBeenCalled();
    });

    it("URL vazia com embeddings habilitados bloqueia salvar", async () => {
      renderPage();
      fireEvent.click(await screen.findByLabelText(/Habilitar embeddings reais/i));
      fireEvent.change(screen.getByLabelText(/URL do servidor/i), {
        target: { value: "" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

      expect(
        await screen.findByText(/Informe a URL do servidor de embeddings/i),
      ).toBeInTheDocument();

      const repo = new LocalStorageEmbeddingConfigRepository();
      const result = await repo.load();
      if (!result.success) throw new Error("expected success");
      expect(result.data.enabled).toBe(false);
    });

    it("carrega configuração de embeddings existente ao abrir", async () => {
      const repo = new LocalStorageEmbeddingConfigRepository();
      await repo.save({ enabled: true, baseUrl: "http://127.0.0.1:9999", model: "bge-m3" });

      renderPage();

      const toggle = await screen.findByLabelText(/Habilitar embeddings reais/i);
      await waitFor(() => expect(toggle).toBeChecked());
      expect(screen.getByLabelText(/URL do servidor/i)).toHaveValue("http://127.0.0.1:9999");
      expect(screen.getByLabelText("Modelo")).toHaveValue("bge-m3");
    });
  });
});
