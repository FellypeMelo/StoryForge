import { describe, it, expect } from "vitest";
import { StoryStructure } from "./story-structure";
import { NarrativeFramework } from "./narrative-framework";

describe("StoryStructure", () => {
  it("creates with all beats filled", () => {
    const structure = StoryStructure.create(
      NarrativeFramework.Kishotenketsu(),
      ["Intro", "Desenvolvimento", "Twist", "Conclusão"],
    );
    expect(structure.isSuccess()).toBe(true);
    expect(structure.missingBeats()).toHaveLength(0);
  });

  it("marks partial beats as missing", () => {
    const structure = StoryStructure.create(
      NarrativeFramework.Kishotenketsu(),
      ["Intro", "", "Twist", "Conclusão"],
    );
    expect(structure.isSuccess()).toBe(false);
    expect(structure.missingBeats()).toContain("Shō (Desenvolvimento)");
  });

  it("counts missing beats correctly", () => {
    const structure = StoryStructure.create(
      NarrativeFramework.Kishotenketsu(),
      ["Intro", "", "", ""],
    );
    expect(structure.missingBeats()).toHaveLength(3);
  });

  it("returns beat count matching framework", () => {
    const structure = StoryStructure.create(
      NarrativeFramework.HeroesJourney(),
      Array(12).fill("filled"),
    );
    expect(structure.beatCount()).toBe(12);
  });

  it("returns framework name", () => {
    const structure = StoryStructure.create(
      NarrativeFramework.SaveTheCat(),
      Array(15).fill("filled"),
    );
    expect(structure.frameworkName()).toBe("Save the Cat");
  });

  it("returns beat labels from framework", () => {
    const structure = StoryStructure.create(
      NarrativeFramework.Kishotenketsu(),
      Array(4).fill(""),
    );
    expect(structure.beatLabels()).toHaveLength(4);
    expect(structure.beatLabels()[0]).toBe("Ki (Introdução)");
  });

  it("getBeat returns filled value by index", () => {
    const structure = StoryStructure.create(
      NarrativeFramework.Kishotenketsu(),
      ["Intro", "Desenv", "Twist", "Conclu"],
    );
    expect(structure.getBeat(0)).toBe("Intro");
    expect(structure.getBeat(3)).toBe("Conclu");
  });

  it("allBeats returns a copy", () => {
    const structure = StoryStructure.create(
      NarrativeFramework.Kishotenketsu(),
      ["A", "B", "C", "D"],
    );
    const beats = structure.allBeats();
    beats[0] = "X";
    expect(structure.getBeat(0)).toBe("A");
  });
});
