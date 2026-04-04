import { describe, it, expect } from "vitest";
import { ScenePolarity, StoryGridValidator } from "./scene-grid";

describe("ScenePolarity", () => {
  it("creates valid positive polarity", () => {
    const p = ScenePolarity.create("positive");
    expect(p.toString()).toBe("+");
    expect(p.value).toBe("positive");
  });

  it("creates valid negative polarity", () => {
    const p = ScenePolarity.create("negative");
    expect(p.toString()).toBe("-");
    expect(p.value).toBe("negative");
  });

  it("rejects invalid polarity", () => {
    expect(() => ScenePolarity.create("neutral" as any)).toThrow();
  });

  it("equals compares by value", () => {
    const p1 = ScenePolarity.create("positive");
    const p2 = ScenePolarity.create("positive");
    const n = ScenePolarity.create("negative");
    expect(p1.equals(p2)).toBe(true);
    expect(p1.equals(n)).toBe(false);
  });
});

describe("StoryGridValidator", () => {
  it("passes when polarity changes from + to -", () => {
    const start = ScenePolarity.create("positive");
    const end = ScenePolarity.create("negative");
    const result = StoryGridValidator.validate(start, end);
    expect(result.valid).toBe(true);
    expect(result.message).toBe("");
  });

  it("passes when polarity changes from - to +", () => {
    const start = ScenePolarity.create("negative");
    const end = ScenePolarity.create("positive");
    const result = StoryGridValidator.validate(start, end);
    expect(result.valid).toBe(true);
  });

  it("rejects when polarity stays + to +", () => {
    const start = ScenePolarity.create("positive");
    const end = ScenePolarity.create("positive");
    const result = StoryGridValidator.validate(start, end);
    expect(result.valid).toBe(false);
    expect(result.message).toContain("inútil");
  });

  it("rejects when polarity stays - to -", () => {
    const start = ScenePolarity.create("negative");
    const end = ScenePolarity.create("negative");
    const result = StoryGridValidator.validate(start, end);
    expect(result.valid).toBe(false);
    expect(result.message).toContain("inútil");
  });
});
