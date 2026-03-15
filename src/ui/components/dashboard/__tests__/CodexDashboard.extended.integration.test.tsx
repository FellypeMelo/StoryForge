import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { CodexDashboard } from "../CodexDashboard";
import { mockDb } from "../../../../test/mock-db";
import { getStandardSeed, STANDARD_PROJECT_ID, STANDARD_BOOK_ID } from "../../../../test/seeds/standard-seed";

describe("CodexDashboard Extended Integration", () => {
  const mockProps = {
    projectId: STANDARD_PROJECT_ID,
    bookId: STANDARD_BOOK_ID,
    onBack: vi.fn(),
  };

  beforeEach(() => {
    mockDb.reset();
    mockDb.seed(getStandardSeed());
    vi.clearAllMocks();
  });

  const waitForNotLoading = async () => {
    await waitFor(() => {
      expect(screen.queryByText(/Consultando os arquivos/i)).not.toBeInTheDocument();
    }, { timeout: 10000 });
  };

  it("should handle World Rule creation, editing and deletion", async () => {
    render(<CodexDashboard {...mockProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Regras/i }));
    await waitForNotLoading();

    // 1. Create
    fireEvent.click(screen.getByText(/\+ Adicionar Novo/i));
    const contentInput = await screen.findByLabelText(/Conteúdo da Regra/i);
    fireEvent.change(contentInput, { target: { value: "Nova Regra de Teste" } });
    fireEvent.click(screen.getByText(/Salvar Regra/i));
    await waitForNotLoading();
    expect(await screen.findByText("Nova Regra de Teste")).toBeInTheDocument();

    // 2. Edit
    fireEvent.click(screen.getByText("Nova Regra de Teste"));
    const editInput = await screen.findByLabelText(/Conteúdo da Regra/i);
    fireEvent.change(editInput, { target: { value: "Regra Atualizada" } });
    fireEvent.click(screen.getByText(/Salvar Regra/i));

    // Use findBy to wait for refresh
    expect(await screen.findByText("Regra Atualizada")).toBeInTheDocument();

    // 3. Move to Project (from SlideOver)
    fireEvent.click(screen.getByText("Regra Atualizada"));
    fireEvent.click(await screen.findByRole("button", { name: /^Mover para Universo$/i }));
    
    await waitFor(() => {
      expect(screen.queryByText("Regra Atualizada")).not.toBeInTheDocument();
    }, { timeout: 10000 });

    // 4. Delete (Go to Universe scope to find it)
    fireEvent.click(screen.getByRole("button", { name: /^Universo$/i }));
    await waitForNotLoading();
    
    fireEvent.click(screen.getByText("Regra Atualizada"));
    const deleteBtn = await screen.findByTitle("Excluir Regra");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText("Regra Atualizada")).not.toBeInTheDocument();
    }, { timeout: 10000 });
  }, 30000);

  it("should handle Timeline Event creation and deletion", async () => {
    render(<CodexDashboard {...mockProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Linha do Tempo/i }));
    await waitForNotLoading();

    // Create
    fireEvent.click(screen.getByText(/\+ Adicionar Novo/i));
    fireEvent.change(await screen.findByLabelText(/Descrição do Evento/i), { target: { value: "Evento Épico" } });
    fireEvent.click(screen.getByText(/Salvar Evento/i));
    await waitForNotLoading();
    expect(await screen.findByText("Evento Épico")).toBeInTheDocument();

    // Delete
    fireEvent.click(screen.getByText("Evento Épico"));
    const deleteBtn = await screen.findByTitle("Excluir Evento");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText("Evento Épico")).not.toBeInTheDocument();
    }, { timeout: 10000 });
  }, 30000);

  it("should handle Relationship creation and deletion", async () => {
    render(<CodexDashboard {...mockProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Relacionamentos/i }));
    await waitForNotLoading();

    // Create
    fireEvent.click(screen.getByText(/\+ Adicionar Novo/i));
    fireEvent.change(await screen.findByLabelText(/Natureza do Vínculo/i), { target: { value: "Inimigos Mortais" } });
    fireEvent.click(screen.getByText(/Salvar Relacionamento/i));
    await waitForNotLoading();
    expect(await screen.findByText("Inimigos Mortais")).toBeInTheDocument();

    // Delete
    fireEvent.click(screen.getByText("Inimigos Mortais"));
    const deleteBtn = await screen.findByTitle("Excluir Relacionamento");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText("Inimigos Mortais")).not.toBeInTheDocument();
    }, { timeout: 10000 });
  }, 30000);

  it("should handle Blacklist creation and deletion", async () => {
    render(<CodexDashboard {...mockProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Lista Negra/i }));
    await waitForNotLoading();

    // Create
    fireEvent.click(screen.getByText(/\+ Adicionar Novo/i));
    fireEvent.change(await screen.findByLabelText(/Termo \/ Clichê/i), { target: { value: "Profecia" } });
    fireEvent.click(screen.getByText(/Salvar Entrada/i));
    await waitForNotLoading();
    expect(await screen.findByText("Profecia")).toBeInTheDocument();

    // Delete
    fireEvent.click(screen.getByText("Profecia"));
    const deleteBtn = await screen.findByTitle("Excluir Entrada");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText("Profecia")).not.toBeInTheDocument();
    }, { timeout: 10000 });
  }, 30000);

  it("should handle Location creation, editing and deletion", async () => {
    render(<CodexDashboard {...mockProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Locais/i }));
    await waitForNotLoading();

    // 1. Create
    fireEvent.click(screen.getByText(/\+ Adicionar Novo/i));
    const nameInput = await screen.findByLabelText(/Nome/i);
    fireEvent.change(nameInput, { target: { value: "Cidade Flutuante" } });
    fireEvent.click(screen.getByText(/Salvar Local/i));
    await waitForNotLoading();
    expect(await screen.findByText("Cidade Flutuante")).toBeInTheDocument();

    // 2. Edit
    fireEvent.click(screen.getByText("Cidade Flutuante"));
    const editInput = await screen.findByLabelText(/Nome/i);
    fireEvent.change(editInput, { target: { value: "Cidade das Nuvens" } });
    fireEvent.click(screen.getByText(/Salvar Local/i));
    await waitForNotLoading();
    expect(await screen.findByText("Cidade das Nuvens")).toBeInTheDocument();

    // 3. Delete
    fireEvent.click(screen.getByText("Cidade das Nuvens"));
    const deleteBtn = await screen.findByTitle("Excluir Local");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText("Cidade das Nuvens")).not.toBeInTheDocument();
    }, { timeout: 10000 });
  }, 30000);
});
