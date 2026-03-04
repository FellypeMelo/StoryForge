import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CharacterForm } from "../character/CharacterForm";
import { Character } from "../../../domain/character";

import { CharacterId } from "../../../domain/value-objects/character-id";
import { ProjectId } from "../../../domain/value-objects/project-id";

const charId = CharacterId.generate();
const projectId = ProjectId.generate();

const mockCharacter = Character.create({
  id: charId,
  projectId: projectId,
  name: "Original Name",
  age: 30,
  occupation: "Writer",
  physical_description: "Tall and thin",
  goal: "Finish the book",
  motivation: "Legacy",
  internal_conflict: "Self-doubt",
  ocean_scores: {
    openness: 80,
    conscientiousness: 70,
    extraversion: 40,
    agreeableness: 60,
    neuroticism: 50,
  },
  voice: "Formal",
  mannerisms: "Scratches chin",
});

describe("CharacterForm", () => {
  it("should render all form fields with initial data including Hauge and Voice", () => {
    render(<CharacterForm character={mockCharacter} onSave={() => {}} onCancel={() => {}} />);

    expect(screen.getByDisplayValue("Original Name")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Writer")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30")).toBeInTheDocument();
    
    // Hauge fields
    expect(screen.getByLabelText(/A Ferida/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Crença Limitante/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/O Medo/i)).toBeInTheDocument();
    
    // Voice fields
    expect(screen.getByLabelText(/Ritmo /i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nível de Formalidade/i)).toBeInTheDocument();
  });

  it("should call onSave with updated Hauge Arc and Physical Tells", async () => {
    const onSave = vi.fn();
    render(<CharacterForm character={mockCharacter} onSave={onSave} onCancel={() => {}} />);

    const woundInput = screen.getByLabelText(/A Ferida/i);
    fireEvent.change(woundInput, { target: { value: "Childhood Trauma" } });

    const saveButton = screen.getByText(/Salvar Alterações/i);
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalled();
    const savedCharacter = onSave.mock.calls[0][0] as Character;
    expect(savedCharacter.toProps().hauge_wound).toBe("Childhood Trauma");
  });

  it("should show validation error for empty name", () => {
    render(<CharacterForm character={mockCharacter} onSave={() => {}} onCancel={() => {}} />);

    const nameInput = screen.getByLabelText(/Nome/i);
    fireEvent.change(nameInput, { target: { value: "" } });

    const saveButton = screen.getByText(/Salvar Alterações/i);
    fireEvent.click(saveButton);

    expect(screen.getByText(/Nome é obrigatório/i)).toBeInTheDocument();
  });
});
