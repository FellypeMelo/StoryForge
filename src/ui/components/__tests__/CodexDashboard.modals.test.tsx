import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CodexDashboard } from "../dashboard/CodexDashboard";
import { mockDb } from "../../../test/mock-db";

describe("CodexDashboard Modal Integration", () => {
  const mockProps: any = {
    projectId: "123e4567-e89b-12d3-a456-426614174000",
    bookId: "123e4567-e89b-12d3-a456-426614174001",
    onBack: vi.fn(),
  };

  beforeEach(() => {
    mockDb.reset();
  });

  const waitForNotLoading = async () => {
    await waitFor(() => {
      expect(screen.queryByText(/Consultando os arquivos/i)).not.toBeInTheDocument();
    }, { timeout: 10000 });
  };

  it("should open SlideOver with LocationForm when 'Criar Local' is clicked", async () => {
    render(<CodexDashboard {...mockProps} />);
    await waitForNotLoading();

    // Switch to locations tab
    const locationsTab = screen.getByRole("button", { name: /Locais/i });
    fireEvent.click(locationsTab);
    await waitForNotLoading();

    const addLocationButton = screen.getByRole("button", { name: /Criar Local/i });
    fireEvent.click(addLocationButton);

    expect(screen.getByText(/Detalhes do Local/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome/i)).toBeInTheDocument();
  });

  it("should open SlideOver with WorldRuleForm when 'Criar Regra' is clicked", async () => {
    render(<CodexDashboard {...mockProps} />);
    await waitForNotLoading();

    // Switch to rules tab
    const rulesTab = screen.getByRole("button", { name: /Regras/i });
    fireEvent.click(rulesTab);
    await waitForNotLoading();

    const addRuleButton = screen.getByRole("button", { name: /Criar Regra/i });
    fireEvent.click(addRuleButton);

    expect(screen.getAllByText(/Regra do Mundo/i)[0]).toBeInTheDocument();
    expect(screen.getByLabelText(/Conteúdo da Regra/i)).toBeInTheDocument();
  });

  it("should open SlideOver with CharacterWizard when 'Criar Personagem' is clicked", async () => {
    render(<CodexDashboard {...mockProps} />);
    await waitForNotLoading();

    const addCharacterButton = screen.getByRole("button", { name: /Criar Manualmente/i });
    fireEvent.click(addCharacterButton);

    expect(screen.getByText(/Novo Personagem/i)).toBeInTheDocument();
    expect(screen.getByText(/Passo 1/i)).toBeInTheDocument();
  });

  it("should reset form state when modal is closed and reopened", async () => {
    render(<CodexDashboard {...mockProps} />);
    await waitForNotLoading();

    // Open Location modal
    const locationsTab = screen.getByRole("button", { name: /Locais/i });
    fireEvent.click(locationsTab);
    await waitForNotLoading();
    
    fireEvent.click(screen.getByRole("button", { name: /Criar Local/i }));

    // Type something
    const nameInput = screen.getByLabelText(/Nome/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Lugar Temporário" } });
    expect(nameInput.value).toBe("Lugar Temporário");

    // Close modal via backdrop
    const backdrop = screen.getByTestId("slideover-backdrop");
    fireEvent.click(backdrop);

    // Wait for modal to be removed from DOM
    await waitFor(() => {
      expect(screen.queryByText(/Detalhes do Local/i)).not.toBeInTheDocument();
    });

    // Reopen
    fireEvent.click(screen.getByRole("button", { name: /Criar Local/i }));

    // Check if input is empty (now uses default 'Novo Local')
    const newNameInput = screen.getByLabelText(/Nome/i) as HTMLInputElement;
    expect(newNameInput.value).toBe("Novo Local");
  });
});
