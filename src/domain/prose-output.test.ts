import { describe, it, expect } from "vitest";
import { ProseOutput } from "./prose-output";

describe("ProseOutput", () => {
  it("creates prose output with 3 versions", () => {
    const output = ProseOutput.create({
      draft: "The blade struck stone, sending sparks through the cold air.",
      critique: "The draft uses some 'tell' — 'cold air' is generic. Needs visceral grounding.",
      finalVersion: "Steel rang against granite. Sparks licked the damp stone, hissing like dying embers.",
    });
    expect(output.draft).toBeDefined();
    expect(output.critique).toBeDefined();
    expect(output.finalVersion).toBeDefined();
  });

  it("throws on empty draft", () => {
    expect(() =>
      ProseOutput.create({
        draft: "",
        critique: "Nothing to critique",
        finalVersion: "Polished version",
      }),
    ).toThrow("Draft");
  });

  it("throws on empty critique", () => {
    expect(() =>
      ProseOutput.create({
        draft: "Some draft",
        critique: "",
        finalVersion: "Polished version",
      }),
    ).toThrow("Critique");
  });

  it("throws on empty finalVersion", () => {
    expect(() =>
      ProseOutput.create({
        draft: "Some draft",
        critique: "Some critique",
        finalVersion: "",
      }),
    ).toThrow("Final");
  });

  it("counts words in finalVersion", () => {
    const output = ProseOutput.create({
      draft: "Some draft",
      critique: "Some critique",
      finalVersion: "The quick brown fox jumps over the lazy dog",
    });
    expect(output.wordCount).toBe(9);
  });

  it("counts wordCount with multiple words", () => {
    const output = ProseOutput.create({
      draft: "Some draft",
      critique: "Some critique",
      finalVersion: "One two three four five six seven eight nine ten eleven",
    });
    expect(output.wordCount).toBe(11);
  });
});
