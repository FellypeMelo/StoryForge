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
  it("should render all form fields with initial data", () => {
    render(<CharacterForm character={mockCharacter} onSave={() => {}} onCancel={() => {}} />);

    expect(screen.getByDisplayValue("Original Name")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Writer")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Tall and thin")).toBeInTheDocument();
  });

  it("should call onSave with updated data when form is submitted", async () => {
    const onSave = vi.fn();
    render(<CharacterForm character={mockCharacter} onSave={onSave} onCancel={() => {}} />);

    const nameInput = screen.getByLabelText(/Nome/i);
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    const saveButton = screen.getByText(/Salvar Alterações/i);
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalled();
    const savedCharacter = onSave.mock.calls[0][0] as Character;
    expect(savedCharacter.name).toBe("Updated Name");
    expect(savedCharacter.id.equals(charId)).toBe(true);
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
