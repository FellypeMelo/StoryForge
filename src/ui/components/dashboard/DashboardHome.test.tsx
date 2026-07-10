import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardHome } from "./DashboardHome";

describe("DashboardHome", () => {
  const base = {
    appVersion: "0.1.0",
    dbHealthy: true,
    error: null,
    onNavigate: vi.fn(),
    onSwitchUniverse: vi.fn(),
  };

  it("exibe o título de boas-vindas", () => {
    render(<DashboardHome {...base} />);
    expect(screen.getByText(/Bem-vindo à Forja/i)).toBeInTheDocument();
  });

  it("Trocar Universo dispara callback", () => {
    const onSwitchUniverse = vi.fn();
    render(<DashboardHome {...base} onSwitchUniverse={onSwitchUniverse} />);
    fireEvent.click(screen.getByRole("button", { name: /Trocar Universo/i }));
    expect(onSwitchUniverse).toHaveBeenCalledOnce();
  });

  it("cada ação rápida navega para sua rota", () => {
    const onNavigate = vi.fn();
    render(<DashboardHome {...base} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole("button", { name: /Gerador de Ideias/i }));
    expect(onNavigate).toHaveBeenCalledWith("ideation");

    fireEvent.click(screen.getByRole("button", { name: /Codex/i }));
    expect(onNavigate).toHaveBeenCalledWith("codex");

    fireEvent.click(screen.getByRole("button", { name: /Estrutura/i }));
    expect(onNavigate).toHaveBeenCalledWith("structure");

    fireEvent.click(screen.getByRole("button", { name: /Capítulos/i }));
    expect(onNavigate).toHaveBeenCalledWith("chapters");

    fireEvent.click(screen.getByRole("button", { name: /Assistente de Escrita/i }));
    expect(onNavigate).toHaveBeenCalledWith("write");
  });

  it("não contém botões sem ação (nenhum onClick vazio)", () => {
    const onNavigate = vi.fn();
    const onSwitchUniverse = vi.fn();
    render(
      <DashboardHome
        {...base}
        onNavigate={onNavigate}
        onSwitchUniverse={onSwitchUniverse}
      />,
    );
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => fireEvent.click(btn));
    // Every button must trigger one of the two callbacks.
    expect(onNavigate.mock.calls.length + onSwitchUniverse.mock.calls.length).toBe(buttons.length);
  });

  it("mostra estado de saúde do banco", () => {
    render(<DashboardHome {...base} dbHealthy={false} />);
    expect(screen.getByText(/Desconectado/i)).toBeInTheDocument();
  });

  it("exibe erro do sistema quando presente", () => {
    render(<DashboardHome {...base} error="Falha na IPC" />);
    expect(screen.getByRole("alert")).toHaveTextContent(/Falha na IPC/i);
  });
});
