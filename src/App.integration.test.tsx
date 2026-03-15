import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { App } from "./App";
import { mockDb } from "./test/mock-db";
import { getStandardSeed, STANDARD_PROJECT_ID, STANDARD_BOOK_ID } from "./test/seeds/standard-seed";

describe("App Integration", () => {
  beforeEach(() => {
    mockDb.reset();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should navigate through the entire flow: Project -> Book -> Dashboard", async () => {
    mockDb.seed(getStandardSeed());
    render(<App />);

    // 1. Project Selection
    await waitFor(() => {
      expect(screen.getByText(/Seus Universos/i)).toBeInTheDocument();
    });
    
    const projectBtn = screen.getByText("A Forja das Sombras");
    fireEvent.click(projectBtn);

    // 2. Book Selection
    await waitFor(() => {
      expect(screen.getByText(/Livros desta Saga/i)).toBeInTheDocument();
    });
    
    const bookBtn = screen.getByText("Livro 1: O Despertar");
    fireEvent.click(bookBtn);

    // 3. Dashboard
    await waitFor(() => {
      expect(screen.getByText(/Bem-vindo à Forja/i)).toBeInTheDocument();
    });
    
    expect(localStorage.getItem("storyforge_last_project")).toBe(STANDARD_PROJECT_ID);
    expect(localStorage.getItem("storyforge_last_book")).toBe(STANDARD_BOOK_ID);
  });

  it("should restore state from localStorage on startup", async () => {
    mockDb.seed(getStandardSeed());
    localStorage.setItem("storyforge_last_project", STANDARD_PROJECT_ID);
    localStorage.setItem("storyforge_last_book", STANDARD_BOOK_ID);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Bem-vindo à Forja/i)).toBeInTheDocument();
    });
  });

  it("should handle global navigation via sidebar", async () => {
    mockDb.seed(getStandardSeed());
    localStorage.setItem("storyforge_last_project", STANDARD_PROJECT_ID);
    localStorage.setItem("storyforge_last_book", STANDARD_BOOK_ID);

    render(<App />);

    // Navigate to Codex (target sidebar button specifically)
    const codexLink = await screen.findByRole("button", { name: /^Codex da História$/i });
    fireEvent.click(codexLink);

    await waitFor(() => {
      // CodexDashboard should render its header
      expect(screen.getByRole("heading", { name: /^Codex da História$/i })).toBeInTheDocument();
      expect(screen.getByText(/Personagens/i)).toBeInTheDocument();
    });

    // Navigate back to Dashboard via sidebar
    const dashboardLink = screen.getByRole("button", { name: /Painel/i });
    fireEvent.click(dashboardLink);

    await waitFor(() => {
      expect(screen.getByText(/Bem-vindo à Forja/i)).toBeInTheDocument();
    });
  });

  it("should allow switching universes", async () => {
    mockDb.seed(getStandardSeed());
    localStorage.setItem("storyforge_last_project", STANDARD_PROJECT_ID);
    localStorage.setItem("storyforge_last_book", STANDARD_BOOK_ID);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Trocar Universo/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Trocar Universo/i));

    await waitFor(() => {
      expect(screen.getByText(/Seus Universos/i)).toBeInTheDocument();
    });

    expect(localStorage.getItem("storyforge_last_project")).toBeNull();
    expect(localStorage.getItem("storyforge_last_book")).toBeNull();
  });
});
