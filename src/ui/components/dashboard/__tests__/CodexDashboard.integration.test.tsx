import { describe, it, expect, beforeEach } from "vitest";
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
    mockDb.seed(getStandardSeed());
  });

  it("should show seeded lore items and allow adding a new one without duplication", async () => {
    render(<CodexDashboard {...mockProps} />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText(/Consultando os arquivos/i)).not.toBeInTheDocument();
    });

    // 1. Check existing character from seed
    expect((await screen.findAllByText("Alaric")).length).toBeGreaterThan(0);

    // 1.1 Open Character Detail (CharacterDashboard)
    fireEvent.click(screen.getByText("Alaric"));
    expect(await screen.findByText("Ficha Completa")).toBeInTheDocument();
    expect(screen.getByText("Líder nato")).toBeInTheDocument();
    expect(screen.getByText("Sarcasmo")).toBeInTheDocument();
    
    // Go back to list
    fireEvent.click(screen.getByRole("button", { name: /Voltar/i }));
    expect((await screen.findAllByText("Alaric")).length).toBeGreaterThan(0);

    // 2. Go to Locations and check seeded location
    fireEvent.click(screen.getByRole("button", { name: /Locais/i }));
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
    
    // In our mock DB, we can actually count or verify the state if needed,
    // but the UI list is our primary source of truth for integration.
  });

  it("should correctly switch between tabs and load corresponding lore", async () => {
    render(<CodexDashboard {...mockProps} />);

    await waitFor(() => {
      expect(screen.queryByText(/Consultando os arquivos/i)).not.toBeInTheDocument();
    });

    // Rules
    fireEvent.click(screen.getByRole("button", { name: /Regras/i }));
    expect(await screen.findByText("Magia")).toBeInTheDocument();

    // Timeline
    fireEvent.click(screen.getByRole("button", { name: /Linha do Tempo/i }));
    expect(await screen.findByText("A Quebra do Selo")).toBeInTheDocument();

    // Relationships
    fireEvent.click(screen.getByRole("button", { name: /Relacionamentos/i }));
    expect(await screen.findByText("Mestre e Aprendiz")).toBeInTheDocument();

    // Blacklist
    fireEvent.click(screen.getByRole("button", { name: /Lista Negra/i }));
    expect(await screen.findByText("Escolhido")).toBeInTheDocument();
  });
});
