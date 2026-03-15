import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { CodexDashboard } from "../CodexDashboard";
import { mockDb } from "../../../../test/mock-db";
import { getStandardSeed, STANDARD_PROJECT_ID, STANDARD_BOOK_ID } from "../../../../test/seeds/standard-seed";

describe("CodexDashboard Integration", () => {
  const mockProps = {
    projectId: STANDARD_PROJECT_ID,
    bookId: STANDARD_BOOK_ID,
    onBack: () => {},
  };

  beforeEach(() => {
    mockDb.reset();
    mockDb.seed(getStandardSeed());
  });

  const waitForNotLoading = async () => {
    await waitFor(() => {
      expect(screen.queryByText(/Consultando os arquivos/i)).not.toBeInTheDocument();
    }, { timeout: 10000 });
  };

  it("should show seeded lore items and allow adding a new one without duplication", async () => {
    render(<CodexDashboard {...mockProps} />);
    await waitForNotLoading();

    // 1. Check existing character from seed
    expect((await screen.findAllByText("Alaric")).length).toBeGreaterThan(0);

    // 1.1 Open Character Detail (CharacterDashboard)
    fireEvent.click(screen.getByText("Alaric"));
    expect(await screen.findByText("Ficha Completa")).toBeInTheDocument();
    expect(screen.getByText("Líder nato")).toBeInTheDocument();
    expect(screen.getByText("Sarcasmo")).toBeInTheDocument();
    
    // Go back to list
    fireEvent.click(screen.getByRole("button", { name: /Voltar/i }));
    await waitForNotLoading();
    expect((await screen.findAllByText("Alaric")).length).toBeGreaterThan(0);

    // 2. Go to Locations and check seeded location
    fireEvent.click(screen.getByRole("button", { name: /Locais/i }));
    await waitForNotLoading();
    expect(await screen.findByText("Vale do Eco")).toBeInTheDocument();

    // 3. Add a NEW location
    fireEvent.click(screen.getByText(/\+ Adicionar Novo/i));
    const nameInput = await screen.findByLabelText(/Nome/i);
    fireEvent.change(nameInput, { target: { value: "Nova Fortaleza" } });
    fireEvent.click(screen.getByText(/Salvar Local/i));

    // 4. Verify it was added to the list
    expect(await screen.findByText("Nova Fortaleza")).toBeInTheDocument();

    // 5. EDIT the same location and verify NO DUPLICATION
    fireEvent.click(screen.getByText("Nova Fortaleza"));
    const editInput = await screen.findByLabelText(/Nome/i);
    fireEvent.change(editInput, { target: { value: "Fortaleza Editada" } });
    fireEvent.click(screen.getByText(/Salvar Local/i));

    // Verify name updated and list still has only 2 locations (seeded + new)
    expect(await screen.findByText("Fortaleza Editada")).toBeInTheDocument();
    expect(screen.queryByText("Nova Fortaleza")).not.toBeInTheDocument();
    expect(screen.getByText("Vale do Eco")).toBeInTheDocument();
  }, 30000);

  it("should correctly switch between tabs and load corresponding lore", async () => {
    render(<CodexDashboard {...mockProps} />);
    await waitForNotLoading();

    // Rules
    fireEvent.click(screen.getByRole("button", { name: /Regras/i }));
    await waitForNotLoading();
    expect(await screen.findByText("Magia")).toBeInTheDocument();

    // Timeline
    fireEvent.click(screen.getByRole("button", { name: /Linha do Tempo/i }));
    await waitForNotLoading();
    expect(await screen.findByText("A Quebra do Selo")).toBeInTheDocument();

    // Relationships
    fireEvent.click(screen.getByRole("button", { name: /Relacionamentos/i }));
    await waitForNotLoading();
    expect(await screen.findByText("Mestre e Aprendiz")).toBeInTheDocument();

    // Blacklist
    fireEvent.click(screen.getByRole("button", { name: /Lista Negra/i }));
    await waitForNotLoading();
    expect(await screen.findByText("Escolhido")).toBeInTheDocument();
  }, 30000);

  it("should filter results based on search query", async () => {
    render(<CodexDashboard {...mockProps} />);
    await waitForNotLoading();

    const searchInput = screen.getByPlaceholderText(/Pesquisar sabedoria/i);
    fireEvent.change(searchInput, { target: { value: "Alaric" } });

    // After typing, results should appear in a search results section
    expect(await screen.findByText(/Resultados da Busca/i)).toBeInTheDocument();
    expect(screen.getByText("Alaric")).toBeInTheDocument();
  }, 30000);

  it("should handle character move and delete", async () => {
    render(<CodexDashboard {...mockProps} />);
    await waitForNotLoading();

    // 1. View character
    fireEvent.click(screen.getByText("Alaric"));
    expect(await screen.findByText("Ficha Completa")).toBeInTheDocument();

    // 2. Test Move to Project (removing from book scope)
    fireEvent.click(screen.getByRole("button", { name: /^Mover para Universo$/i }));
    
    await waitFor(() => {
      expect(screen.queryByText("Alaric")).not.toBeInTheDocument();
    }, { timeout: 10000 });

    // 3. Switch to Universe scope to see Alaric again
    fireEvent.click(screen.getByRole("button", { name: /^Universo$/i }));
    await waitForNotLoading();

    await waitFor(() => {
      expect(screen.getByText("Alaric")).toBeInTheDocument();
      expect(screen.getAllByText("Universo").some(el => el.tagName === "SPAN")).toBe(true);
    }, { timeout: 10000 });

    // 4. Delete character
    fireEvent.click(screen.getByText("Alaric"));
    const deleteBtn = (await screen.findAllByRole("button")).find(b => b.querySelector("svg.lucide-trash2"));
    if (deleteBtn) fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText("Alaric")).not.toBeInTheDocument();
    }, { timeout: 10000 });
  }, 30000);

  it("should toggle between book and project scope", async () => {
    render(<CodexDashboard {...mockProps} />);
    await waitForNotLoading();

    const projectScopeBtn = screen.getByRole("button", { name: /^Universo$/i });
    fireEvent.click(projectScopeBtn);
    await waitForNotLoading();

    expect(await screen.findByText("Alaric")).toBeInTheDocument();
  }, 30000);
});
