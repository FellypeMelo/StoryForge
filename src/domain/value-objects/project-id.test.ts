import { describe, it, expect } from "vitest";
import { ProjectId } from "./project-id";

describe("ProjectId", () => {
  it("should create a valid ProjectId from a UUID", () => {
    const validUuid = "550e8400-e29b-41d4-a716-446655440000";
    const id = ProjectId.create(validUuid);
    expect(id.value).toBe(validUuid);
  });

  it("should throw error for invalid UUID", () => {
    const invalidUuid = "invalid-uuid";
    expect(() => ProjectId.create(invalidUuid)).toThrow("Invalid ProjectId: must be a valid UUID");
  });

  it("should generate a random valid UUID if none provided", () => {
    const id = ProjectId.generate();
    expect(id.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("should support equality comparison", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    const id1 = ProjectId.create(uuid);
    const id2 = ProjectId.create(uuid);
    const id3 = ProjectId.generate();

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
