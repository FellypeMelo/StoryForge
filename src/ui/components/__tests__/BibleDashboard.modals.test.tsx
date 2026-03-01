import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BibleDashboard } from "../dashboard/BibleDashboard";

// Mock Tauri invoke
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(async (cmd) => {
    if (cmd === "list_characters") return [];
    if (cmd === "list_locations") return [];
    if (cmd === "list_world_rules") return [];
    return [];
  }),
}));

describe("BibleDashboard Modal Integration", () => {
  it("should open SlideOver with LocationForm when 'Criar Local' is clicked", async () => {
    render(<BibleDashboard />);

    // Switch to locations tab
    const locationsTab = screen.getByRole("button", { name: /Locais/i });
    fireEvent.click(locationsTab);

    // Wait for the list to load and the button to be available
    await waitFor(() => {
      expect(screen.getByText(/Nenhum local encontrado/i)).toBeInTheDocument();
    });

    const addLocationButton = screen.getByRole("button", { name: /Criar Local/i });
    fireEvent.click(addLocationButton);

    expect(screen.getByText(/Detalhes do Local/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome/i)).toBeInTheDocument();
  });

  it("should open SlideOver with WorldRuleForm when 'Criar Regra' is clicked", async () => {
    render(<BibleDashboard />);

    // Switch to rules tab
    const rulesTab = screen.getByRole("button", { name: /Regras do Mundo/i });
    fireEvent.click(rulesTab);

    // Wait for the list to load
    await waitFor(() => {
      expect(screen.getByText(/Nenhuma regra encontrada/i)).toBeInTheDocument();
    });

    const addRuleButton = screen.getByRole("button", { name: /Criar Regra/i });
    fireEvent.click(addRuleButton);

    expect(screen.getByText(/Regra do Mundo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Conteúdo da Regra/i)).toBeInTheDocument();
  });

  it("should open SlideOver with CharacterWizard when 'Criar Personagem' is clicked", async () => {
    render(<BibleDashboard />);

    // Wait for characters tab to load (it's default)
    await waitFor(() => {
      expect(screen.getByText(/Nenhum personagem encontrado/i)).toBeInTheDocument();
    });

    const addCharacterButton = screen.getByRole("button", { name: /Criar Personagem/i });
    fireEvent.click(addCharacterButton);

    // Should NOT replace the whole screen (dashboard should still be visible in background)
    // and should show the SlideOver with Wizard
    expect(screen.getByText(/Novo Personagem/i)).toBeInTheDocument();
    expect(screen.getByText(/Passo 1/i)).toBeInTheDocument();
    
    // Header from Dashboard should still be there (unlike before where it replaced the view)
    expect(screen.getByText(/Bíblia da História/i)).toBeInTheDocument();
  });

  it("should reset form state when modal is closed and reopened", async () => {
    render(<BibleDashboard />);

    // Open Location modal
    const locationsTab = screen.getByRole("button", { name: /Locais/i });
    fireEvent.click(locationsTab);
    await waitFor(() => expect(screen.getByRole("button", { name: /Criar Local/i })).toBeInTheDocument());
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

    // Check if input is empty
    const newNameInput = screen.getByLabelText(/Nome/i) as HTMLInputElement;
    expect(newNameInput.value).toBe("");
  });
});
