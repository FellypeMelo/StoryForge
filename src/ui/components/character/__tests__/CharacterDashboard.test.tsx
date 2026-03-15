import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CharacterDashboard } from "../CharacterDashboard";
import { Character } from "../../../../domain/character";
import { CharacterId } from "../../../../domain/value-objects/character-id";
import { ProjectId } from "../../../../domain/value-objects/project-id";
import { BookId } from "../../../../domain/value-objects/book-id";

describe("CharacterDashboard", () => {
  const mockCharacter = Character.create({
    id: CharacterId.create("550e8400-e29b-41d4-a716-446655440010"),
    projectId: ProjectId.create("550e8400-e29b-41d4-a716-446655440000"),
    bookId: BookId.create("550e8400-e29b-41d4-a716-446655440001"),
    name: "Alaric",
    age: 30,
    occupation: "Guerreiro",
    physical_description: "Alto e cicatrizado.",
    hauge_identity: "Guerreiro solitário",
    hauge_essence: "Líder nato",
    voice_sentence_length: "Curta",
    voice_formality: "Informal",
    voice_evasion_mechanism: "Sarcasmo",
    physical_tells: JSON.stringify(["Coça a cicatriz", "Evita contato", "Aperta a espada"]),
    ocean_scores: {
      openness: 80,
      conscientiousness: 50,
      extraversion: 70,
      agreeableness: 60,
      neuroticism: 40,
    }
  });

  const onEdit = vi.fn();
  const onDelete = vi.fn();

  it("should render character details correctly", () => {
    render(<CharacterDashboard character={mockCharacter} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText("Alaric")).toBeInTheDocument();
    expect(screen.getByText("Ficha Completa")).toBeInTheDocument();
    
    // Check occupation (using exact match to avoid matching identity)
    expect(screen.getByText(/^Guerreiro$/)).toBeInTheDocument();
    expect(screen.getByText(/30 anos/i)).toBeInTheDocument();
    
    // Check Hauge Arc
    expect(screen.getByText("Guerreiro solitário")).toBeInTheDocument();
    expect(screen.getByText("Líder nato")).toBeInTheDocument();

    // Check Voice
    expect(screen.getByText("Informal")).toBeInTheDocument();
    expect(screen.getByText("Sarcasmo")).toBeInTheDocument();

    // Check Physical Tells
    expect(screen.getByText("Coça a cicatriz")).toBeInTheDocument();
    
    // Check Radar Chart exists
    expect(screen.getByTestId("ocean-radar-chart")).toBeInTheDocument();
  });

  it("should call onEdit when edit button is clicked", () => {
    render(<CharacterDashboard character={mockCharacter} onEdit={onEdit} onDelete={onDelete} />);
    
    fireEvent.click(screen.getByText(/Editar/i));
    expect(onEdit).toHaveBeenCalledWith(mockCharacter);
  });

  it("should call onDelete when delete button is clicked", () => {
    render(<CharacterDashboard character={mockCharacter} onEdit={onEdit} onDelete={onDelete} />);
    
    // The delete button uses an icon, so we search by its container or role if it had one.
    // In CharacterDashboard.tsx: <button onClick={() => onDelete(...)} className="..."> <Trash2 ... /> </button>
    // It doesn't have text. Let's find it by the lucide icon name or just use a data-testid if I can.
    // Wait, I can't add data-testid without modifying the source.
    // I can use the fact that it's the second button in the header.
    // Or I can use querySelector.
    
    const buttons = screen.getAllByRole("button");
    // Header has Edit and Delete.
    // Index 0: Edit, Index 1: Delete
    fireEvent.click(buttons[1]);
    
    expect(onDelete).toHaveBeenCalledWith(mockCharacter.id.value);
  });

  it("should show 'Rascunho' when character is incomplete", () => {
    const incompleteChar = Character.create({
      id: CharacterId.generate(),
      projectId: ProjectId.create("550e8400-e29b-41d4-a716-446655440000"),
      name: "Incompleto",
      hauge_identity: "", // This will make isComplete() return false
      physical_tells: JSON.stringify(["tell 1", "tell 2", "tell 3"])
    });

    render(<CharacterDashboard character={incompleteChar} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText("Rascunho em Desenvolvimento")).toBeInTheDocument();
  });
});
