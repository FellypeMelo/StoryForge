import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimelineList, RelationshipList, BlacklistList } from "./LoreLists";
import { TimelineEvent } from "../../domain/timeline-event";
import { Relationship } from "../../domain/relationship";
import { BlacklistEntry } from "../../domain/blacklist-entry";
import { TimelineEventId, RelationshipId, BlacklistEntryId } from "../../domain/value-objects/bible-ids";
import { ProjectId } from "../../domain/value-objects/project-id";
import { CharacterId } from "../../domain/value-objects/character-id";

const pId = ProjectId.generate();

describe("LoreLists", () => {
  describe("TimelineList", () => {
    it("should render events", () => {
      const events = [
        TimelineEvent.create({
          id: TimelineEventId.generate(),
          projectId: pId,
          date: "2026",
          description: "Test Event",
        }),
      ];
      render(<TimelineList events={events} />);
      expect(screen.getByText("2026")).toBeInTheDocument();
      expect(screen.getByText("Test Event")).toBeInTheDocument();
    });

    it("should show empty state", () => {
      render(<TimelineList events={[]} />);
      expect(screen.getByText(/No events found/i)).toBeInTheDocument();
    });
  });

  describe("RelationshipList", () => {
    it("should render relationships", () => {
      const rels = [
        Relationship.create({
          id: RelationshipId.generate(),
          projectId: pId,
          characterAId: CharacterId.generate(),
          characterBId: CharacterId.generate(),
          type: "Friends",
        }),
      ];
      render(<RelationshipList relationships={rels} />);
      expect(screen.getByText("Friends")).toBeInTheDocument();
    });
  });

  describe("BlacklistList", () => {
    it("should render entries", () => {
      const entries = [
        BlacklistEntry.create({
          id: BlacklistEntryId.generate(),
          projectId: pId,
          term: "forbidden",
        }),
      ];
      render(<BlacklistList entries={entries} />);
      expect(screen.getByText("forbidden")).toBeInTheDocument();
    });
  });
});
