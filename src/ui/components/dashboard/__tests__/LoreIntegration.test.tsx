import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimelineList, RelationshipList, BlacklistList } from "../LoreLists";
import { TimelineEventForm, RelationshipForm, BlacklistEntryForm } from "../LoreForms";
import { TimelineEvent } from "../../../../domain/timeline-event";
import { Relationship } from "../../../../domain/relationship";
import { BlacklistEntry } from "../../../../domain/blacklist-entry";
import { Character } from "../../../../domain/character";
import { ProjectId } from "../../../../domain/value-objects/project-id";
import { CharacterId } from "../../../../domain/value-objects/character-id";
import { TimelineEventId, RelationshipId, BlacklistEntryId } from "../../../../domain/value-objects/codex-ids";

describe("Lore Components Integration", () => {
  const projectId = ProjectId.create("550e8400-e29b-41d4-a716-446655440000");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Timeline", () => {
    const mockEvent = TimelineEvent.create({
      id: TimelineEventId.create("550e8400-e29b-41d4-a716-446655440040"),
      projectId,
      description: "A Quebra do Selo",
      date: "Ano 0"
    });

    it("should list and select timeline events", () => {
      const onSelect = vi.fn();
      render(<TimelineList events={[mockEvent]} onSelect={onSelect} />);
      expect(screen.getByText("Ano 0")).toBeInTheDocument();
      expect(screen.getByText("A Quebra do Selo")).toBeInTheDocument();
      fireEvent.click(screen.getByText("A Quebra do Selo"));
      expect(onSelect).toHaveBeenCalledWith(mockEvent);
    });

    it("should handle timeline form submission", () => {
      const onSave = vi.fn();
      render(<TimelineEventForm event={mockEvent} onSave={onSave} onCancel={() => {}} />);
      const descInput = screen.getByLabelText(/Descrição do Evento/i);
      fireEvent.change(descInput, { target: { value: "Nova Descrição" } });
      fireEvent.click(screen.getByText(/Salvar Evento/i));
      expect(onSave).toHaveBeenCalled();
      expect(onSave.mock.calls[0][0].description).toBe("Nova Descrição");
    });
  });

  describe("Relationships", () => {
    const charA = Character.generate(projectId, "Alaric");
    const charB = Character.generate(projectId, "Elara");
    const mockRel = Relationship.create({
      id: RelationshipId.create("550e8400-e29b-41d4-a716-446655440050"),
      projectId,
      characterAId: charA.id,
      characterBId: charB.id,
      type: "Mestre e Aprendiz"
    });

    it("should list and select relationships", () => {
      const onSelect = vi.fn();
      render(<RelationshipList relationships={[mockRel]} onSelect={onSelect} />);
      expect(screen.getByText("Mestre e Aprendiz")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Mestre e Aprendiz"));
      expect(onSelect).toHaveBeenCalledWith(mockRel);
    });

    it("should handle relationship form submission", () => {
      const onSave = vi.fn();
      render(
        <RelationshipForm 
          relationship={mockRel} 
          characters={[charA, charB]} 
          onSave={onSave} 
          onCancel={() => {}} 
        />
      );
      const typeInput = screen.getByLabelText(/Natureza do Vínculo/i);
      fireEvent.change(typeInput, { target: { value: "Rivais" } });
      
      // Change Character B select
      const selectB = screen.getByLabelText(/Personagem B/i);
      fireEvent.change(selectB, { target: { value: charB.id.value } });

      fireEvent.click(screen.getByText(/Salvar Relacionamento/i));
      expect(onSave).toHaveBeenCalled();
      expect(onSave.mock.calls[0][0].type).toBe("Rivais");
    });

    it("should show error when same character is selected", () => {
      render(
        <RelationshipForm 
          relationship={mockRel} 
          characters={[charA, charB]} 
          onSave={() => {}} 
          onCancel={() => {}} 
        />
      );
      const selectB = screen.getByLabelText(/Personagem B/i);
      // Set B to the same as A (which is charA by default in mockRel)
      fireEvent.change(selectB, { target: { value: charA.id.value } });
      
      fireEvent.click(screen.getByText(/Salvar Relacionamento/i));
      expect(screen.getByText(/Selecione personagens diferentes/i)).toBeInTheDocument();
    });
  });

  describe("Blacklist", () => {
    const mockEntry = BlacklistEntry.create({
      id: BlacklistEntryId.create("550e8400-e29b-41d4-a716-446655440060"),
      projectId,
      term: "Escolhido",
      category: "Clichê"
    });

    it("should list and select blacklist entries", () => {
      const onSelect = vi.fn();
      render(<BlacklistList entries={[mockEntry]} onSelect={onSelect} />);
      expect(screen.getByText("Escolhido")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Escolhido"));
      expect(onSelect).toHaveBeenCalledWith(mockEntry);
    });

    it("should handle blacklist form submission", () => {
      const onSave = vi.fn();
      render(<BlacklistEntryForm entry={mockEntry} onSave={onSave} onCancel={() => {}} />);
      const termInput = screen.getByLabelText(/Termo \/ Clichê/i);
      fireEvent.change(termInput, { target: { value: "Herói" } });
      fireEvent.click(screen.getByText(/Salvar Entrada/i));
      expect(onSave).toHaveBeenCalled();
      expect(onSave.mock.calls[0][0].term).toBe("Herói");
    });
  });
});
