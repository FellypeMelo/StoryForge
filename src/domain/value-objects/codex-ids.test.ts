import { describe, it, expect } from "vitest";
import {
  LocationId,
  WorldRuleId,
  TimelineEventId,
  RelationshipId,
  BlacklistEntryId,
} from "./codex-ids";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("Codex IDs", () => {
  describe("LocationId", () => {
    it("should create from UUID", () => {
      const id = LocationId.create(VALID_UUID);
      expect(id.value).toBe(VALID_UUID);
    });
    it("should generate random", () => {
      expect(LocationId.generate()).toBeInstanceOf(LocationId);
    });
    it("should throw on invalid", () => {
      expect(() => LocationId.create("invalid")).toThrow("Invalid LocationId");
    });
  });

  describe("WorldRuleId", () => {
    it("should create from UUID", () => {
      const id = WorldRuleId.create(VALID_UUID);
      expect(id.value).toBe(VALID_UUID);
    });
    it("should generate random", () => {
      expect(WorldRuleId.generate()).toBeInstanceOf(WorldRuleId);
    });
    it("should throw on invalid", () => {
      expect(() => WorldRuleId.create("invalid")).toThrow("Invalid WorldRuleId");
    });
  });

  describe("TimelineEventId", () => {
    it("should create from UUID", () => {
      const id = TimelineEventId.create(VALID_UUID);
      expect(id.value).toBe(VALID_UUID);
    });
    it("should generate random", () => {
      expect(TimelineEventId.generate()).toBeInstanceOf(TimelineEventId);
    });
    it("should throw on invalid", () => {
      expect(() => TimelineEventId.create("invalid")).toThrow("Invalid TimelineEventId");
    });
  });

  describe("RelationshipId", () => {
    it("should create from UUID", () => {
      const id = RelationshipId.create(VALID_UUID);
      expect(id.value).toBe(VALID_UUID);
    });
    it("should generate random", () => {
      expect(RelationshipId.generate()).toBeInstanceOf(RelationshipId);
    });
    it("should throw on invalid", () => {
      expect(() => RelationshipId.create("invalid")).toThrow("Invalid RelationshipId");
    });
  });

  describe("BlacklistEntryId", () => {
    it("should create from UUID", () => {
      const id = BlacklistEntryId.create(VALID_UUID);
      expect(id.value).toBe(VALID_UUID);
    });
    it("should generate random", () => {
      expect(BlacklistEntryId.generate()).toBeInstanceOf(BlacklistEntryId);
    });
    it("should throw on invalid", () => {
      expect(() => BlacklistEntryId.create("invalid")).toThrow("Invalid BlacklistEntryId");
    });
  });
});
