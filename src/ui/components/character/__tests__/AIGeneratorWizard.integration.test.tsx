import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AIGeneratorWizard } from "../AIGeneratorWizard";
import { Character } from "../../../../domain/character";

describe("AIGeneratorWizard Integration", () => {
  const projectId = "550e8400-e29b-41d4-a716-446655440000";
  const mockOnGenerated = vi.fn();
  const mockOnCancel = vi.fn();
  
  const mockRepository = {
    save: vi.fn().mockResolvedValue({ success: true })
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should navigate through steps and trigger AI generation", async () => {
    render(
      <AIGeneratorWizard 
        projectId={projectId} 
        onGenerated={mockOnGenerated} 
        onCancel={mockOnCancel} 
        repository={mockRepository}
      />
    );

    // STEP 1
    expect(screen.getByText(/Passo 1\/2/i)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Arthur, Elara/i), { target: { value: "AI Hero" } });
    fireEvent.click(screen.getByText(/Próximo/i));

    // STEP 2
    expect(screen.getByText(/Passo 2\/2/i)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Sobre o que é a história/i), { target: { value: "Epic quest" } });
    
    // Trigger generation
    fireEvent.click(screen.getByText(/Forjar Alma/i));

    // Generation takes 1500ms in DummyLlmPort
    // Wait for the callback
    await waitFor(() => {
      expect(mockOnGenerated).toHaveBeenCalled();
    }, { timeout: 3000 });

    const generatedChar = mockOnGenerated.mock.calls[0][0] as Character;
    expect(generatedChar.name).toBe("AI Hero");
    expect(generatedChar.ocean_scores.openness).toBe(80); // "High" mapped to 80
    expect(generatedChar.hauge_identity).toBe("O Eremita Tecnológico");
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it("should allow canceling", () => {
    render(
      <AIGeneratorWizard 
        projectId={projectId} 
        onGenerated={mockOnGenerated} 
        onCancel={mockOnCancel} 
        repository={mockRepository}
      />
    );

    // The cancel button is an X icon button.
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]); // X button is the first one
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
