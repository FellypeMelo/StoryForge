import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import { ProjectSelector } from "../ProjectSelector";
import { mockDb } from "../../../../test/mock-db";
import { getStandardSeed } from "../../../../test/seeds/standard-seed";

describe("ProjectSelector Integration", () => {
  const onSelectProject = vi.fn();

  beforeEach(() => {
    mockDb.reset();
    vi.clearAllMocks();
  });

  it("should list projects and handle selection", async () => {
    mockDb.seed(getStandardSeed());
    render(<ProjectSelector onSelectProject={onSelectProject} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Carregando universos/i)).not.toBeInTheDocument();
    });

    // Check if seeded project is visible
    const projectBtn = screen.getByText("A Forja das Sombras");
    expect(projectBtn).toBeInTheDocument();

    // Select project
    fireEvent.click(projectBtn);
    expect(onSelectProject).toHaveBeenCalledWith("550e8400-e29b-41d4-a716-446655440000");
  });

  it("should show empty state when no projects exist", async () => {
    render(<ProjectSelector onSelectProject={onSelectProject} />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhum Universo Encontrado/i)).toBeInTheDocument();
    });
  });

  it("should create a new project", async () => {
    render(<ProjectSelector onSelectProject={onSelectProject} />);

    await waitFor(() => {
      expect(screen.queryByText(/Carregando universos/i)).not.toBeInTheDocument();
    });

    // Open creation form
    fireEvent.click(screen.getByText(/Novo Universo/i));
    expect(screen.getByText(/Criar Novo Universo/i)).toBeInTheDocument();

    // Fill form
    const nameInput = screen.getByLabelText(/Nome do Universo/i);
    const descInput = screen.getByLabelText(/Descrição Curta/i);
    
    fireEvent.change(nameInput, { target: { value: "O Novo Reino" } });
    fireEvent.change(descInput, { target: { value: "Uma nova aventura começa." } });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /^Criar$/i }));

    // Verify callback was called with a UUID
    await waitFor(() => {
      expect(onSelectProject).toHaveBeenCalledWith(expect.any(String));
      expect(onSelectProject.mock.calls[0][0]).toMatch(/^[0-9a-f-]{36}$/i);
    });
  });

  it("should show an inline error with retry when loading projects fails", async () => {
    mockDb.seed(getStandardSeed());
    vi.mocked(invoke).mockRejectedValueOnce(new Error("db offline"));

    render(<ProjectSelector onSelectProject={onSelectProject} />);

    expect(await screen.findByText(/Não foi possível carregar seus universos/i)).toBeInTheDocument();
    expect(screen.queryByText("A Forja das Sombras")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/i }));

    expect(await screen.findByText("A Forja das Sombras")).toBeInTheDocument();
    expect(screen.queryByText(/Não foi possível carregar/i)).not.toBeInTheDocument();
  });

  it("should allow canceling project creation", async () => {
    render(<ProjectSelector onSelectProject={onSelectProject} />);

    await waitFor(() => {
      expect(screen.queryByText(/Carregando universos/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Novo Universo/i));
    fireEvent.click(screen.getByText(/Cancelar/i));

    expect(screen.queryByText(/Criar Novo Universo/i)).not.toBeInTheDocument();
  });
});
