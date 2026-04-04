import { describe, it, expect } from "vitest";
import { SequelBeat } from "./sequel-beat";

describe("SequelBeat", () => {
  it("creates a valid sequel beat", () => {
    const beat = SequelBeat.create(
      "Felt devastated",
      ["Betray my friend (lose trust)", "Abandon the quest (fail forever)", "Sacrifice my safety (risk death)"],
      "Decides to investigate"
    );
    expect(beat.isSuccess()).toBe(true);
  });

  it("rejects dilemma with all good options", () => {
    expect(() =>
      SequelBeat.create(
        "Felt happy",
        ["Win lottery", "Go on vacation", "Get promoted"],
        "Decides to celebrate"
      )
    ).toThrow("All options in the dilemma must be bad or carry heavy cost");
  });

  it("accepts dilemma where all options are bad", () => {
    const beat = SequelBeat.create(
      "Felt trapped",
      ["Betray my friend", "Lose my reputation", "Sacrifice my safety"],
      "Decides to take the blame"
    );
    expect(beat.isSuccess()).toBe(true);
  });

  it("rejects empty reaction", () => {
    expect(() => SequelBeat.create("", ["bad option A (worst)", "bad option B (terrible)"], "decision")).toThrow(
      "Reaction must not be empty"
    );
  });

  it("rejects dilemma with only 1 option", () => {
    expect(() => SequelBeat.create("sad", ["one bad option (worst)"], "decision")).toThrow(
      "Dilemma must have at least 2 options"
    );
  });

  it("stores props correctly", () => {
    const beat = SequelBeat.create(
      "Panicked",
      ["Give up (lose everything)", "Fight back (risk death)", "Ask for help (lose face)"],
      "Decides to fight back"
    );
    expect(beat.reaction).toBe("Panicked");
    expect(beat.dilemmaOptions).toHaveLength(3);
    expect(beat.decision).toBe("Decides to fight back");
  });
});
