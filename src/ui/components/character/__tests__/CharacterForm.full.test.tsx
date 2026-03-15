import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CharacterForm } from "../CharacterForm";
import { Character } from "../../../../domain/character";
import { ProjectId } from "../../../../domain/value-objects/project-id";

describe("CharacterForm Full Test", () => {
  const projectId = ProjectId.create("550e8400-e29b-41d4-a716-446655440000");
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  const getMockCharacter = () => Character.generate(projectId, "Alaric");

  it("should render all form sections and fields", () => {
    const char = getMockCharacter();
    render(<CharacterForm character={char} onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByText(/Atributos Principais/i)).toBeInTheDocument();
    expect(screen.getByText(/Perfil Psicológico/i)).toBeInTheDocument();
    expect(screen.getByText(/Arco de Michael Hauge/i)).toBeInTheDocument();
    expect(screen.getByText(/Perfil de Voz/i)).toBeInTheDocument();
    expect(screen.getByText(/Physical Tells/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/^Nome$/i)).toHaveValue("Alaric");
    expect(screen.getByLabelText(/^Idade$/i)).toBeInTheDocument();
  });

  it("should handle ocean scores change", () => {
    const char = getMockCharacter();
    render(<CharacterForm character={char} onSave={mockOnSave} onCancel={mockOnCancel} />);

    const opennessSlider = screen.getAllByRole("slider")[0];
    fireEvent.change(opennessSlider, { target: { value: "90" } });
    
    expect(screen.getByText("90%")).toBeInTheDocument();
  });

  it("should handle list item additions and removals", () => {
    const char = getMockCharacter();
    render(<CharacterForm character={char} onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Add verbal tic
    fireEvent.click(screen.getByText(/Adicionar Tic/i));
    const ticInputs = screen.getAllByPlaceholderText(/Tic verbal/i);
    expect(ticInputs.length).toBe(1);
    fireEvent.change(ticInputs[0], { target: { value: "Hehe" } });

    // Add physical tell (already has 3 by default from Character.generate)
    fireEvent.click(screen.getByText(/Novo Tell/i));
    const tellInputs = screen.getAllByPlaceholderText(/Tell #/i);
    expect(tellInputs.length).toBe(4);

    // Try to remove a tell (minimum 3 check)
    const removeTellButtons = screen.getAllByRole("button").filter(b => b.querySelector("svg.lucide-x") && b.getAttribute("disabled") === null);
    // Wait, the X buttons for tells use <X size={8} />.
    // Let's find them by their class or container.
    // Actually, I can just click the 4th one.
    fireEvent.click(screen.getAllByRole("button").find(b => b.classList.contains("bg-red-500"))!);
    expect(screen.getAllByPlaceholderText(/Tell #/i).length).toBe(3);
  });

  it("should validate name requirement", () => {
    const char = getMockCharacter();
    render(<CharacterForm character={char} onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: "" } });
    fireEvent.click(screen.getByText(/Salvar Alterações/i));

    expect(screen.getByText(/Nome é obrigatório/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("should handle full save with all fields", () => {
    const char = getMockCharacter();
    render(<CharacterForm character={char} onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/^Nome$/i), { target: { value: "Updated Name" } });
    fireEvent.change(screen.getByLabelText(/^Idade$/i), { target: { value: "40" } });
    fireEvent.change(screen.getByLabelText(/^Identidade \/ Máscara \(Identity\)$/i), { target: { value: "Identity" } });
    fireEvent.change(screen.getByLabelText(/^Mecanismo de Evasão$/i), { target: { value: "Silence" } });

    // Fill the 3 default tells to pass validation if they were empty
    const tellInputs = screen.getAllByPlaceholderText(/Tell #/i);
    fireEvent.change(tellInputs[0], { target: { value: "T1" } });
    fireEvent.change(tellInputs[1], { target: { value: "T2" } });
    fireEvent.change(tellInputs[2], { target: { value: "T3" } });

    fireEvent.click(screen.getByText(/Salvar Alterações/i));

    expect(mockOnSave).toHaveBeenCalled();
    const saved = mockOnSave.mock.calls[0][0] as Character;
    expect(saved.name).toBe("Updated Name");
    expect(saved.age).toBe(40);
    expect(saved.hauge_identity).toBe("Identity");
    expect(saved.voice_evasion_mechanism).toBe("Silence");
  });

  it("should call onCancel", () => {
    const char = getMockCharacter();
    render(<CharacterForm character={char} onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Cancel button is the X in the header
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
