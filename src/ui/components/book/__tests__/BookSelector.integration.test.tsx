import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BookSelector } from "../BookSelector";
import { mockDb } from "../../../../test/mock-db";
import { getStandardSeed, STANDARD_PROJECT_ID } from "../../../../test/seeds/standard-seed";

describe("BookSelector Integration", () => {
  const onSelectBook = vi.fn();
  const onBack = vi.fn();

  beforeEach(() => {
    mockDb.reset();
    vi.clearAllMocks();
  });

  it("should list books and handle selection", async () => {
    mockDb.seed(getStandardSeed());
    render(
      <BookSelector 
        projectId={STANDARD_PROJECT_ID} 
        onSelectBook={onSelectBook} 
        onBack={onBack} 
      />
    );

    // Wait for loading
    await waitFor(() => {
      expect(screen.queryByText(/Carregando livros/i)).not.toBeInTheDocument();
    });

    // Project name from seed should be visible
    expect(screen.getByText(/A Forja das Sombras/i)).toBeInTheDocument();

    // Check if seeded book is visible
    const bookBtn = screen.getByText("Livro 1: O Despertar");
    expect(bookBtn).toBeInTheDocument();

    // Select book
    fireEvent.click(bookBtn);
    expect(onSelectBook).toHaveBeenCalledWith("550e8400-e29b-41d4-a716-446655440001");
  });

  it("should handle back button", async () => {
    mockDb.seed(getStandardSeed());
    render(
      <BookSelector 
        projectId={STANDARD_PROJECT_ID} 
        onSelectBook={onSelectBook} 
        onBack={onBack} 
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/Carregando livros/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Voltar aos Universos/i));
    expect(onBack).toHaveBeenCalled();
  });

  it("should show empty state when no books exist", async () => {
    // Seed with project but no books
    mockDb.seed({
      projects: [{ id: STANDARD_PROJECT_ID, name: "Empty Universe", createdAt: new Date().toISOString() }],
      books: []
    });

    render(
      <BookSelector 
        projectId={STANDARD_PROJECT_ID} 
        onSelectBook={onSelectBook} 
        onBack={onBack} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Nenhum Livro Registrado/i)).toBeInTheDocument();
    });
  });

  it("should create a new book", async () => {
    mockDb.seed(getStandardSeed());
    render(
      <BookSelector 
        projectId={STANDARD_PROJECT_ID} 
        onSelectBook={onSelectBook} 
        onBack={onBack} 
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/Carregando livros/i)).not.toBeInTheDocument();
    });

    // Open creation form
    fireEvent.click(screen.getByText(/Novo Livro/i));
    expect(screen.getByText(/Criar Novo Livro/i)).toBeInTheDocument();

    // Fill form
    const titleInput = screen.getByLabelText(/Título do Livro/i);
    fireEvent.change(titleInput, { target: { value: "O Retorno" } });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /^Criar$/i }));

    // Verify callback was called
    await waitFor(() => {
      expect(onSelectBook).toHaveBeenCalledWith(expect.any(String));
    });
  });
});
