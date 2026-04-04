import { describe, it, expect } from "vitest";
import { SceneId } from "./scene-id";

describe("SceneId", () => {
  it("should create a valid SceneId from a UUID", () => {
    const validUuid = "550e8400-e29b-41d4-a716-446655440000";
    const id = SceneId.create(validUuid);
    expect(id.value).toBe(validUuid);
  });

  it("should throw error for invalid UUID", () => {
    const invalidUuid = "invalid-uuid";
    expect(() => SceneId.create(invalidUuid)).toThrow(
      "Invalid SceneId: must be a valid UUID",
    );
  });

  it("should generate unique SceneIds", () => {
    const id1 = SceneId.generate();
    const id2 = SceneId.generate();
    expect(id1.equals(id2)).toBe(false);
  });
});
