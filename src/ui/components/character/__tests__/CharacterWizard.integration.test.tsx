import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CharacterWizard } from "../CharacterWizard";
import { Character } from "../../../../domain/character";
import { ProjectId } from "../../../../domain/value-objects/project-id";

describe("CharacterWizard Integration", () => {
  const projectId = ProjectId.create("550e8400-e29b-41d4-a716-446655440000");
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  const getNewCharacter = () => Character.generate(projectId, "");

  it("should navigate through all steps and save a complete character", async () => {
    const character = getNewCharacter();
    render(<CharacterWizard character={character} onSave={mockOnSave} onCancel={mockOnCancel} />);

    // STEP 1: Fundamentals
    expect(screen.getByText(/Passo 1 de 4/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: "Alaric" } });
    fireEvent.change(screen.getByLabelText(/Idade/i), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText(/Ocupação/i), { target: { value: "Guerreiro" } });
    fireEvent.click(screen.getByText(/Próximo/i));

    // STEP 2: OCEAN
    expect(screen.getByText(/Passo 2 de 4/i)).toBeInTheDocument();
    expect(screen.getByText(/Perfil Psicológico/i)).toBeInTheDocument();
    
    // Test a slider
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "80" } }); // Openness
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("Alto")).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Próximo/i));

    // STEP 3: Hauge Arc
    expect(screen.getByText(/Passo 3 de 4/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Identidade/i), { target: { value: "Soldado" } });
    fireEvent.change(screen.getByLabelText(/Essência/i), { target: { value: "Líder" } });
    fireEvent.click(screen.getByText(/Próximo/i));

    // STEP 4: Voice & Presence
    expect(screen.getByText(/Passo 4 de 4/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Extensão das Frases/i), { target: { value: "Curtas" } });
    
    // Add Physical Tells (need at least 3)
    const addTellBtn = screen.getAllByRole("button").find(b => b.querySelector("svg.lucide-plus"));
    if (addTellBtn) {
      fireEvent.click(addTellBtn);
      fireEvent.click(addTellBtn);
      fireEvent.click(addTellBtn);
    }
    
    const tellInputs = screen.getAllByPlaceholderText(/Evita contato visual/i);
    fireEvent.change(tellInputs[0], { target: { value: "Tell 1" } });
    fireEvent.change(tellInputs[1], { target: { value: "Tell 2" } });
    fireEvent.change(tellInputs[2], { target: { value: "Tell 3" } });

    // Final Save
    fireEvent.click(screen.getByText(/Finalizar Ficha/i));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
      const savedChar = mockOnSave.mock.calls[0][0] as Character;
      expect(savedChar.name).toBe("Alaric");
      expect(savedChar.age).toBe(30);
      expect(savedChar.ocean_scores.openness).toBe(80);
      expect(savedChar.hauge_identity).toBe("Soldado");
      expect(savedChar.physical_tells_list).toContain("Tell 1");
    });
  });

  it("should show error if name is empty on final save", async () => {
    const character = getNewCharacter();
    render(<CharacterWizard character={character} onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Go to step 4 without name
    fireEvent.click(screen.getByText(/Próximo/i));
    fireEvent.click(screen.getByText(/Próximo/i));
    fireEvent.click(screen.getByText(/Próximo/i));
    
    // Add tells to pass that check
    const addTellBtn = screen.getAllByRole("button").find(b => b.querySelector("svg.lucide-plus"));
    if (addTellBtn) {
      fireEvent.click(addTellBtn); fireEvent.click(addTellBtn); fireEvent.click(addTellBtn);
    }
    const tellInputs = screen.getAllByPlaceholderText(/Evita contato visual/i);
    fireEvent.change(tellInputs[0], { target: { value: "T1" } });
    fireEvent.change(tellInputs[1], { target: { value: "T2" } });
    fireEvent.change(tellInputs[2], { target: { value: "T3" } });

    fireEvent.click(screen.getByText(/Finalizar Ficha/i));

    // Should jump back to step 1 and show error
    expect(screen.getByText(/Passo 1 de 4/i)).toBeInTheDocument();
    expect(screen.getByText(/Nome é obrigatório/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("should alert and stay on step 4 if fewer than 3 tells are provided", async () => {
    const character = getNewCharacter();
    render(<CharacterWizard character={character} onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: "Valid Name" } });

    // Go to step 4
    fireEvent.click(screen.getByText(/Próximo/i));
    fireEvent.click(screen.getByText(/Próximo/i));
    fireEvent.click(screen.getByText(/Próximo/i));

    fireEvent.click(screen.getByText(/Finalizar Ficha/i));

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("pelo menos 3 traços físicos"));
    expect(screen.getByText(/Passo 4 de 4/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("should auto-save to localStorage and load draft", async () => {
    const character = getNewCharacter();
    const { unmount } = render(<CharacterWizard character={character} onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: "Draft Name" } });
    
    // Check localStorage
    const draftKey = `character_draft_${character.id.value}`;
    const saved = JSON.parse(localStorage.getItem(draftKey) || "{}");
    expect(saved.name).toBe("Draft Name");

    unmount();

    // Re-render
    render(<CharacterWizard character={character} onSave={mockOnSave} onCancel={mockOnCancel} />);
    expect(screen.getByLabelText(/Nome/i)).toHaveValue("Draft Name");
  });
});
