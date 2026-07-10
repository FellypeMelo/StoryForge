import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppShell } from "./AppShell";

function renderShell(onNavigate = vi.fn(), currentPath = "dashboard") {
  return render(
    <AppShell
      appVersion="0.1.0"
      dbHealthy={true}
      onNavigate={onNavigate}
      currentPath={currentPath}
    >
      <p>conteúdo</p>
    </AppShell>,
  );
}

describe("AppShell", () => {
  it("renderiza os filhos", () => {
    renderShell();
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("expõe navegação para todas as rotas reais", () => {
    renderShell();
    for (const label of ["Painel", "Ideação", "Codex", "Estrutura", "Capítulos", "Escrita", "Preferências"]) {
      expect(screen.getByRole("button", { name: new RegExp(label, "i") })).toBeInTheDocument();
    }
  });

  it("navega ao clicar num item", () => {
    const onNavigate = vi.fn();
    renderShell(onNavigate);
    fireEvent.click(screen.getByRole("button", { name: /Ideação/i }));
    expect(onNavigate).toHaveBeenCalledWith("ideation");
  });

  it("Preferências navega para settings", () => {
    const onNavigate = vi.fn();
    renderShell(onNavigate);
    fireEvent.click(screen.getByRole("button", { name: /Preferências/i }));
    expect(onNavigate).toHaveBeenCalledWith("settings");
  });

  it("marca o item ativo com aria-current", () => {
    renderShell(vi.fn(), "codex");
    expect(screen.getByRole("button", { name: /Codex/i })).toHaveAttribute("aria-current", "page");
  });

  it("botão de recolher tem aria-label", () => {
    renderShell();
    expect(screen.getByRole("button", { name: /recolher|expandir/i })).toBeInTheDocument();
  });

  it("não renderiza links mortos (Manuscrito, Arquitetura, Verificação)", () => {
    renderShell();
    expect(screen.queryByRole("button", { name: /Manuscrito/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Arquitetura/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Verificação/i })).not.toBeInTheDocument();
  });
});
