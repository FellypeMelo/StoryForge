import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SettingsPage } from "./SettingsPage";
import { ToastProvider } from "../shared/Toast";
import { LocalStorageProviderConfigRepository } from "../../../infrastructure/local/local-storage-provider-config-repository";

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
});
