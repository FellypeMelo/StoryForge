import { describe, it, expect } from "vitest";
import { Cliffhanger, CliffhangerType } from "./cliffhanger";

describe("Cliffhanger", () => {
  it("creates a Pre-point cliffhanger", () => {
    const ch = Cliffhanger.create(CliffhangerType.PrePoint(), "To be continued...");
    expect(ch.type.label).toBe("Pre-point");
    expect(ch.description).toBe("To be continued...");
  });

  it("creates a Climactic cliffhanger", () => {
    const ch = Cliffhanger.create(CliffhangerType.Climactic(), "The truth explodes");
    expect(ch.type.label).toBe("Climático");
  });

  it("creates a Post-point cliffhanger", () => {
    const ch = Cliffhanger.create(CliffhangerType.PostPoint(), "Aftermath reveal");
    expect(ch.type.label).toBe("Post-point");
  });

  it("rejects empty description", () => {
    expect(() => Cliffhanger.create(CliffhangerType.PrePoint(), "")).toThrow(
      "Cliffhanger description must not be empty"
    );
  });

  it("rejects whitespace-only description", () => {
    expect(() => Cliffhanger.create(CliffhangerType.PrePoint(), "   ")).toThrow(
      "Cliffhanger description must not be empty"
    );
  });
});
