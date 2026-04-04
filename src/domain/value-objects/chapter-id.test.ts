import { describe, it, expect } from "vitest";
import { ChapterId } from "./chapter-id";

describe("ChapterId", () => {
  it("should create a valid ChapterId from a UUID", () => {
    const validUuid = "550e8400-e29b-41d4-a716-446655440000";
    const id = ChapterId.create(validUuid);
    expect(id.value).toBe(validUuid);
  });

  it("should throw error for invalid UUID", () => {
    const invalidUuid = "invalid-uuid";
    expect(() => ChapterId.create(invalidUuid)).toThrow(
      "Invalid ChapterId: must be a valid UUID",
    );
  });

  it("should generate unique ChapterIds", () => {
    const id1 = ChapterId.generate();
    const id2 = ChapterId.generate();
    expect(id1.equals(id2)).toBe(false);
  });
});
