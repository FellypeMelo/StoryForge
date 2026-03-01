import { describe, it, expect } from "vitest";
import { LocationId, WorldRuleId } from "./bible-ids";

describe("Bible IDs", () => {
  it("LocationId should validate UUID", () => {
    const validUuid = crypto.randomUUID();
    const id = LocationId.create(validUuid);
    expect(id.value).toBe(validUuid);
    expect(() => LocationId.create("invalid")).toThrow("Invalid LocationId: must be a valid UUID");
  });

  it("WorldRuleId should generate unique UUIDs", () => {
    const id1 = WorldRuleId.generate();
    const id2 = WorldRuleId.generate();
    expect(id1.value).not.toBe(id2.value);
    expect(id1.equals(id2)).toBe(false);
  });
});
