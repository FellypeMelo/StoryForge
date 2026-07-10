import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { CodexDashboard } from "../dashboard/CodexDashboard";
import { ToastProvider } from "../shared/Toast";
import { mockDb } from "../../../test/mock-db";

describe("CodexDashboard Unit", () => {
  const mockProps: any = {
    projectId: "123e4567-e89b-12d3-a456-426614174000",
    bookId: "123e4567-e89b-12d3-a456-426614174001",
    onBack: vi.fn(),
  };

  const renderDashboard = () =>
    render(
      <ToastProvider>
        <CodexDashboard {...mockProps} />
      </ToastProvider>,
    );

  beforeEach(() => {
    mockDb.reset();
  });

  it("should render all lore tabs", () => {
    renderDashboard();

    // Check for buttons in the nav
    expect(screen.getByRole("button", { name: /Personagens/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Locais/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Regras do Mundo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Linha do Tempo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Relacionamentos/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Lista Negra/i })).toBeInTheDocument();
  });

  it("should show characters tab by default after loading", async () => {
    renderDashboard();

    // Should eventually show empty state (since mockDb is empty)
    await waitFor(() => {
      expect(screen.getByText(/Nenhum personagem encontrado/i)).toBeInTheDocument();
    });
  });

  it("should show search results panel when searching", async () => {
    mockDb.seed({
      characters: [{ id: "c1", name: "Search Hero", project_id: mockProps.projectId }]
    });

    renderDashboard();

    const searchInput = screen.getByPlaceholderText(/Pesquisar sabedoria.../i);
    fireEvent.change(searchInput, { target: { value: "Search" } });

    await waitFor(() => {
      expect(screen.getByText(/Resultados da Busca/i)).toBeInTheDocument();
      expect(screen.getByText(/Search Hero/i)).toBeInTheDocument();
    });
  });

  it("deve reindexar o índice semântico e mostrar um toast de sucesso com a contagem", async () => {
    mockDb.seed({
      characters: [
        { id: "c1", name: "Hero", project_id: mockProps.projectId },
        { id: "c2", name: "Villain", project_id: mockProps.projectId },
      ],
    });

    renderDashboard();
    await waitFor(() => {
      expect(screen.queryByText(/Consultando os arquivos/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Reindexar busca semântica/i }));

    await waitFor(() => {
      expect(screen.getByText(/2 itens reindexados/i)).toBeInTheDocument();
    });
  });
});
