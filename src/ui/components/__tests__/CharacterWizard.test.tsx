import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CharacterWizard } from "../character/CharacterWizard";
import { Character } from "../../../domain/character";
import { ProjectId } from "../../../domain/value-objects/project-id";

import { CharacterId } from "../../../domain/value-objects/character-id";

describe("CharacterWizard", () => {
  const mockCharacter = Character.create({
    id: CharacterId.generate(),
    projectId: ProjectId.create("550e8400-e29b-41d4-a716-446655440000"),
    name: "Test Character"
  });

  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  it("should navigate through 3 steps", () => {
    render(
      <CharacterWizard 
        character={mockCharacter} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    // Initial step (Core Attributes)
    expect(screen.getByText(/Atributos Principais/i)).toBeInTheDocument();
    expect(screen.queryByText(/Perfil Psicológico/i)).not.toBeInTheDocument();

    // Go to Step 2
    const nextButton = screen.getByRole("button", { name: /Próximo/i });
    fireEvent.click(nextButton);
    expect(screen.getByText(/Perfil Psicológico/i)).toBeInTheDocument();

    // Go to Step 3
    fireEvent.click(screen.getByRole("button", { name: /Próximo/i }));
    expect(screen.getByText(/Núcleo Narrativo/i)).toBeInTheDocument();

    // Go back to Step 2
    const backButton = screen.getByRole("button", { name: /Voltar/i });
    fireEvent.click(backButton);
    expect(screen.getByText(/Perfil Psicológico/i)).toBeInTheDocument();
  });

  it("should persist data when switching steps", () => {
    render(
      <CharacterWizard 
        character={mockCharacter} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    // Enter name in step 1
    const nameInput = screen.getByPlaceholderText(/Nome do Personagem/i);
    fireEvent.change(nameInput, { target: { value: "Updated Name", name: "name" } });

    // Go to Step 2
    fireEvent.click(screen.getByRole("button", { name: /Próximo/i }));
    
    // Go back to Step 1
    fireEvent.click(screen.getByRole("button", { name: /Voltar/i }));

    // Check if name is still there
    expect(screen.getByDisplayValue("Updated Name")).toBeInTheDocument();
  });

  it("should show validation error on blur if name is empty", () => {
    render(
      <CharacterWizard 
        character={mockCharacter} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    const nameInput = screen.getByPlaceholderText(/Nome do Personagem/i);
    
    // Clear the name
    fireEvent.change(nameInput, { target: { value: "", name: "name" } });
    
    // Trigger blur
    fireEvent.blur(nameInput);

    expect(screen.getByText(/Nome é obrigatório/i)).toBeInTheDocument();
  });

  it("should render OCEAN radar chart in step 2", () => {
    render(
      <CharacterWizard 
        character={mockCharacter} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    // Go to Step 2
    fireEvent.click(screen.getByRole("button", { name: /Próximo/i }));

    // Check for chart elements (we'll use a test-id or specific text)
    expect(screen.getByTestId("ocean-radar-chart")).toBeInTheDocument();
  });

  it("should display semantic labels for OCEAN scores", () => {
    render(
      <CharacterWizard 
        character={mockCharacter} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    // Go to Step 2
    fireEvent.click(screen.getByRole("button", { name: /Próximo/i }));

    // Default 50% should be 'Moderate' (or similar term)
    expect(screen.getAllByText(/Moderado/i).length).toBeGreaterThan(0);
  });

  it("should show character counters for textareas", () => {
    render(
      <CharacterWizard 
        character={mockCharacter} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    // Physical description in Step 1
    const bioArea = screen.getByPlaceholderText(/Traços visuais/i);
    fireEvent.change(bioArea, { target: { value: "A tall man", name: "physical_description" } });

    // Should show "10 / 500"
    expect(screen.getByText(/10 \/ 500/i)).toBeInTheDocument();
  });

  it("should show tooltip on hover", async () => {
    render(
      <CharacterWizard 
        character={mockCharacter} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    // Go to Step 2
    fireEvent.click(screen.getByRole("button", { name: /Próximo/i }));

    // Find help icon for Neuroticism
    const helpIcon = screen.getByTestId("help-neuroticism");
    fireEvent.mouseEnter(helpIcon);

    expect(await screen.findByText(/Tendência a experienciar emoções negativas/i)).toBeInTheDocument();
  });

  it("should restore draft from localStorage", () => {
    const draftData = {
      ...mockCharacter.toProps(),
      name: "Restored Draft Name"
    };
    
    // Set item in localStorage
    localStorage.setItem(
      `character_draft_${mockCharacter.id.value}`, 
      JSON.stringify(draftData)
    );

    render(
      <CharacterWizard 
        character={mockCharacter} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByDisplayValue("Restored Draft Name")).toBeInTheDocument();
    
    localStorage.clear();
  });
});


