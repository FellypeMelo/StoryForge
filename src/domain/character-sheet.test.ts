import { describe, it, expect } from "vitest";
import { CharacterSheet } from "./character-sheet";
import { CharacterId } from "./value-objects/character-id";
import { ProjectId } from "./value-objects/project-id";
import { OceanProfile, OceanTraitScore } from "./ocean-profile";
import { HaugeArc } from "./hauge-arc";
import { VoiceProfile, PhysicalTells } from "./voice-profile";

describe("CharacterSheet", () => {
  const id = CharacterId.generate();
  const projectId = ProjectId.generate();
  const name = "Test Character";
  
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

  it("should create a CharacterSheet with all components and identity", () => {
    const hauge = HaugeArc.create({
      wound: "W",
      belief: "B",
      fear: "F",
      identity: "I",
      essence: "E",
    });

    const sheet = CharacterSheet.create({
      id,
      projectId,
      name,
      ocean,
      hauge,
      voice,
      tells,
    });

    expect(sheet.id.equals(id)).toBe(true);
    expect(sheet.projectId.equals(projectId)).toBe(true);
    expect(sheet.name).toBe(name);
    expect(sheet.isComplete()).toBe(true);
  });

  it("should mark as draft (incomplete) if HaugeArc is missing", () => {
    const sheet = CharacterSheet.create({
      id,
      projectId,
      name,
      ocean,
      voice,
      tells,
    });

    expect(sheet.isComplete()).toBe(false);
  });
});
