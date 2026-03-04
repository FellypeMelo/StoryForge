import { describe, it, expect } from "vitest";
import { CharacterSheet } from "./character-sheet";
import { OceanProfile, OceanTraitScore } from "./ocean-profile";
import { HaugeArc } from "./hauge-arc";
import { VoiceProfile, PhysicalTells } from "./voice-profile";

describe("CharacterSheet", () => {
  const ocean = OceanProfile.create({
    openness: OceanTraitScore.Medium,
    conscientiousness: OceanTraitScore.Medium,
    extraversion: OceanTraitScore.Medium,
    agreeableness: OceanTraitScore.Medium,
    neuroticism: OceanTraitScore.Medium,
  });

  const voice = VoiceProfile.create({
    sentenceLength: "Medium",
    formality: "Neutral",
    verbalTics: [],
    evasionMechanism: "None",
  });

  const tells = PhysicalTells.create(["Tell 1", "Tell 2", "Tell 3"]);

  it("should create a CharacterSheet with all components", () => {
    const hauge = HaugeArc.create({
      wound: "W",
      belief: "B",
      fear: "F",
      identity: "I",
      essence: "E",
    });

    const sheet = CharacterSheet.create({
      ocean,
      hauge,
      voice,
      tells,
    });

    expect(sheet.isComplete()).toBe(true);
  });

  it("should mark as draft (incomplete) if HaugeArc is missing", () => {
    const sheet = CharacterSheet.create({
      ocean,
      voice,
      tells,
    });

    expect(sheet.isComplete()).toBe(false);
  });
});
