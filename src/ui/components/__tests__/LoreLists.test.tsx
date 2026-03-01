import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimelineList, RelationshipList, BlacklistList } from "../dashboard/LoreLists";
import { TimelineEvent } from "../../../domain/timeline-event";
import { Relationship } from "../../../domain/relationship";
import { BlacklistEntry } from "../../../domain/blacklist-entry";
import { ProjectId } from "../../../domain/value-objects/project-id";
import { CharacterId } from "../../../domain/value-objects/character-id";
import { TimelineEventId } from "../../../domain/value-objects/bible-ids";
import { RelationshipId } from "../../../domain/value-objects/bible-ids";
import { BlacklistEntryId } from "../../../domain/value-objects/bible-ids";

describe("LoreLists", () => {
  const projectId = ProjectId.create("550e8400-e29b-41d4-a716-446655440000");

  describe("TimelineList", () => {
    it("should render events", () => {
      const events = [
        TimelineEvent.create({
          id: TimelineEventId.generate(),
          projectId: projectId,
          date: "1200 AC",
          description: "O Início",
          causalDependencies: []
        })
      ];
      render(<TimelineList events={events} />);
      expect(screen.getByText("1200 AC")).toBeInTheDocument();
      expect(screen.getByText("O Início")).toBeInTheDocument();
    });

    it("should show empty state", () => {
      render(<TimelineList events={[]} />);
      expect(screen.getByText(/Nenhum evento encontrado/i)).toBeInTheDocument();
    });
  });

  describe("RelationshipList", () => {
    it("should render relationships", () => {
      const rels = [
        Relationship.create({
          id: RelationshipId.generate(),
          projectId: projectId,
          characterAId: CharacterId.generate(),
          characterBId: CharacterId.generate(),
          type: "Inimigos"
        })
      ];
      render(<RelationshipList relationships={rels} />);
      expect(screen.getByText("Inimigos")).toBeInTheDocument();
    });
  });

  describe("BlacklistList", () => {
    it("should render entries", () => {
      const entries = [
        BlacklistEntry.create({
          id: BlacklistEntryId.generate(),
          projectId: projectId,
          term: "clichê",
          category: "estilo",
          reason: "evitar"
        })
      ];
      render(<BlacklistList entries={entries} />);
      expect(screen.getByText("clichê")).toBeInTheDocument();
    });
  });
});
