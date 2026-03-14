import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TimelineEvent } from "../../../../domain/timeline-event";
import { Relationship } from "../../../../domain/relationship";
import { BlacklistEntry } from "../../../../domain/blacklist-entry";
import { Character } from "../../../../domain/character";
import { CharacterId } from "../../../../domain/value-objects/character-id";
import { ProjectId } from "../../../../domain/value-objects/project-id";
import { TimelineEventForm, RelationshipForm, BlacklistEntryForm } from "../LoreForms";

describe("LoreForms", () => {
  const projectId = ProjectId.create("123e4567-e89b-12d3-a456-426614174000");

  describe("TimelineEventForm", () => {
    const mockEvent = TimelineEvent.create({
      id: CharacterId.generate() as any,
      projectId,
      description: "Evento Existente",
      date: "2024",
    });

    it("should render correctly with initial data", () => {
      render(<TimelineEventForm event={mockEvent} onSave={vi.fn()} onCancel={vi.fn()} />);
      expect(screen.getByDisplayValue("Evento Existente")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2024")).toBeInTheDocument();
    });

    it("should show error when description is empty", () => {
      const onSave = vi.fn();
      render(<TimelineEventForm event={mockEvent} onSave={onSave} onCancel={vi.fn()} />);
      
      const textarea = screen.getByLabelText(/Descrição/i);
      fireEvent.change(textarea, { target: { value: "" } });
      fireEvent.click(screen.getByText(/Salvar Evento/i));

      expect(screen.getByText("Descrição é obrigatória")).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });

    it("should call onSave when form is valid", () => {
      const onSave = vi.fn();
      render(<TimelineEventForm event={mockEvent} onSave={onSave} onCancel={vi.fn()} />);
      
      const dateInput = screen.getByLabelText(/Data/i);
      fireEvent.change(dateInput, { target: { value: "2025" } });
      fireEvent.click(screen.getByText(/Salvar Evento/i));

      expect(onSave).toHaveBeenCalled();
      const savedEvent = onSave.mock.calls[0][0] as TimelineEvent;
      expect(savedEvent.toProps().date).toBe("2025");
    });
  });

  describe("RelationshipForm", () => {
    const charA = Character.create({ id: CharacterId.generate(), projectId, name: "Personagem A" });
    const charB = Character.create({ id: CharacterId.generate(), projectId, name: "Personagem B" });
    
    const mockRel = Relationship.create({
      id: CharacterId.generate() as any,
      projectId,
      characterAId: charA.id,
      characterBId: charB.id,
      type: "Aliados",
    });

    it("should render characters in select options", () => {
      render(
        <RelationshipForm 
          relationship={mockRel} 
          characters={[charA, charB]} 
          onSave={vi.fn()} 
          onCancel={vi.fn()} 
        />
      );
      expect(screen.getByDisplayValue("Personagem A")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Personagem B")).toBeInTheDocument();
    });

    it("should show error when characters are the same", () => {
      const onSave = vi.fn();
      render(
        <RelationshipForm 
          relationship={mockRel} 
          characters={[charA, charB]} 
          onSave={onSave} 
          onCancel={vi.fn()} 
        />
      );
      
      const selects = screen.getAllByRole("combobox");
      fireEvent.change(selects[1], { target: { value: charA.id.value } });
      fireEvent.click(screen.getByText(/Salvar Relacionamento/i));

      expect(screen.getByText("Selecione personagens diferentes")).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });

    it("should call onSave when valid", () => {
      const onSave = vi.fn();
      render(
        <RelationshipForm 
          relationship={mockRel} 
          characters={[charA, charB]} 
          onSave={onSave} 
          onCancel={vi.fn()} 
        />
      );
      
      const typeInput = screen.getByLabelText(/Natureza/i);
      fireEvent.change(typeInput, { target: { value: "Inimigos" } });
      fireEvent.click(screen.getByText(/Salvar Relacionamento/i));

      expect(onSave).toHaveBeenCalled();
      const saved = onSave.mock.calls[0][0] as Relationship;
      expect(saved.toProps().type).toBe("Inimigos");
    });
  });

  describe("BlacklistEntryForm", () => {
    const mockEntry = BlacklistEntry.create({
      id: CharacterId.generate() as any,
      projectId,
      term: "Clichê",
      category: "Estilo",
    });

    it("should render fields correctly", () => {
      render(<BlacklistEntryForm entry={mockEntry} onSave={vi.fn()} onCancel={vi.fn()} />);
      expect(screen.getByDisplayValue("Clichê")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Estilo")).toBeInTheDocument();
    });

    it("should validate required term", () => {
      const onSave = vi.fn();
      render(<BlacklistEntryForm entry={mockEntry} onSave={onSave} onCancel={vi.fn()} />);
      
      const input = screen.getByLabelText(/Termo/i);
      fireEvent.change(input, { target: { value: "" } });
      fireEvent.click(screen.getByText(/Salvar Entrada/i));

      expect(screen.getByText("O termo é obrigatório")).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });

    it("should call onSave with full data", () => {
      const onSave = vi.fn();
      render(<BlacklistEntryForm entry={mockEntry} onSave={onSave} onCancel={vi.fn()} />);
      
      const reasonArea = screen.getByLabelText(/Motivo/i);
      fireEvent.change(reasonArea, { target: { value: "Muito batido" } });
      fireEvent.click(screen.getByText(/Salvar Entrada/i));

      expect(onSave).toHaveBeenCalled();
      const saved = onSave.mock.calls[0][0] as BlacklistEntry;
      expect(saved.toProps().reason).toBe("Muito batido");
    });
  });
});
