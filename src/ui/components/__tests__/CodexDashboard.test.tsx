import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { CodexDashboard } from "../dashboard/CodexDashboard";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(async (cmd) => {
    if (cmd === "list_characters") return [];
    if (cmd === "list_locations") return [];
    if (cmd === "list_world_rules") return [];
    return [];
  }),
}));

describe("CodexDashboard", () => {
  const mockProps: any = {
    projectId: "123e4567-e89b-12d3-a456-426614174000",
    bookId: "123e4567-e89b-12d3-a456-426614174001",
    onBack: () => {},
  };

  it("should render all lore tabs", () => {
    render(<CodexDashboard {...mockProps} />);

    // Check for buttons in the nav
    expect(screen.getByRole("button", { name: /Personagens/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Locais/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Regras do Mundo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Linha do Tempo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Relacionamentos/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Lista Negra/i })).toBeInTheDocument();
  });

  it("should show characters tab by default after loading", async () => {
    render(<CodexDashboard {...mockProps} />);

    // Should show loading initially
    expect(screen.getByText(/Consultando os arquivos/i)).toBeInTheDocument();

    // Should eventually show empty state
    await waitFor(() => {
      expect(screen.getByText(/Nenhum personagem encontrado/i)).toBeInTheDocument();
    });
  });

  it("should show search results panel when searching", async () => {
    // Mock search results
    const mockResults = [
      {
        entity_id: "res-1",
        entity_type: "character",
        snippet: "Search result snippet",
        score: 0.5,
      },
    ];

    const { invoke } = await import("@tauri-apps/api/core");
    vi.mocked(invoke).mockImplementation(async (cmd) => {
      if (cmd === "search_lore") return mockResults;
      if (cmd === "list_characters") return [];
      if (cmd === "list_locations") return [];
      if (cmd === "list_world_rules") return [];
      return [];
    });

    render(<CodexDashboard {...mockProps} />);

    const searchInput = screen.getByPlaceholderText(/Pesquisar sabedoria.../i);
    fireEvent.change(searchInput, { target: { value: "test query" } });

    await waitFor(() => {
      expect(screen.getByText(/Resultados da Busca/i)).toBeInTheDocument();
      expect(screen.getByText(/Search result snippet/i)).toBeInTheDocument();
    });
  });
});
