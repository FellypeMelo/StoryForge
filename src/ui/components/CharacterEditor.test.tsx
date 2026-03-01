import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CharacterEditor } from "./CharacterEditor";
import { Character } from "../../domain/character";
import React from "react";

const mockCharacter: Character = {
  id: "char-123",
  project_id: "proj-123",
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
};

describe("CharacterEditor", () => {
  it("should render all form fields with initial data", () => {
    render(<CharacterEditor character={mockCharacter} onSave={() => {}} onCancel={() => {}} />);

    expect(screen.getByDisplayValue("Original Name")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Writer")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Tall and thin")).toBeInTheDocument();
  });

  it("should call onSave with updated data when form is submitted", async () => {
    const onSave = vi.fn();
    render(<CharacterEditor character={mockCharacter} onSave={onSave} onCancel={() => {}} />);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    const saveButton = screen.getByText(/Save Changes/i);
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Updated Name",
        id: "char-123",
      }),
    );
  });

  it("should show validation error for empty name", () => {
    render(<CharacterEditor character={mockCharacter} onSave={() => {}} onCancel={() => {}} />);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: "" } });

    const saveButton = screen.getByText(/Save Changes/i);
    fireEvent.click(saveButton);

    expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
  });
});
