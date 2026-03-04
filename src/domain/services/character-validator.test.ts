import { describe, it, expect } from "vitest";
import { CharacterValidator } from "./character-validator";
import { CharacterSheet } from "../character-sheet";
import { OceanProfile, OceanTraitScore } from "../ocean-profile";
import { HaugeArc } from "../hauge-arc";
import { VoiceProfile, PhysicalTells } from "../voice-profile";
import { CharacterId } from "../value-objects/character-id";
import { ProjectId } from "../value-objects/project-id";

describe("CharacterValidator", () => {
  const id = CharacterId.generate();
  const projectId = ProjectId.generate();
  const name = "Test";

  const validOcean = OceanProfile.create({
// ... rest of file (I will use replace more surgically)
    openness: OceanTraitScore.Medium,
    conscientiousness: OceanTraitScore.Medium,
    extraversion: OceanTraitScore.Medium,
    agreeableness: OceanTraitScore.Medium,
    neuroticism: OceanTraitScore.Medium,
  });

  const validHauge = HaugeArc.create({
    wound: "W", belief: "B", fear: "F", identity: "I", essence: "E"
  });

  const validVoice = VoiceProfile.create({
    sentenceLength: "Long",
    formality: "Formal",
    verbalTics: ["Therefore"],
    evasionMechanism: "Intellectualization",
  });

  const validTells = PhysicalTells.create(["T1", "T2", "T3"]);

  it("should validate a balanced character", () => {
    const sheet = CharacterSheet.create({
      id,
      projectId,
      name,
      ocean: validOcean,
      hauge: validHauge,
      voice: validVoice,
      tells: validTells,
    });

    const result = CharacterValidator.validate(sheet);
    expect(result.isValid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("should flag 'Mary Sue' anti-pattern (Too perfect OCEAN)", () => {
    const tooPerfectOcean = OceanProfile.create({
      openness: OceanTraitScore.High,
      conscientiousness: OceanTraitScore.High,
      extraversion: OceanTraitScore.High,
      agreeableness: OceanTraitScore.High,
      neuroticism: OceanTraitScore.Low,
    });

    const sheet = CharacterSheet.create({
      id,
      projectId,
      name,
      ocean: tooPerfectOcean,
      hauge: validHauge,
      voice: validVoice,
      tells: validTells,
    });

    const result = CharacterValidator.validate(sheet);
    expect(result.warnings).toContain("Anti-pattern detected: 'Mary Sue' (Too perfect OCEAN profile)");
  });

  it("should flag generic voice (No verbal tics and neutral formality)", () => {
    const genericVoice = VoiceProfile.create({
      sentenceLength: "Medium",
      formality: "Neutral",
      verbalTics: [],
      evasionMechanism: "None",
    });

    const sheet = CharacterSheet.create({
      id,
      projectId,
      name,
      ocean: validOcean,
      hauge: validHauge,
      voice: genericVoice,
      tells: validTells,
    });

    const result = CharacterValidator.validate(sheet);
    expect(result.warnings).toContain("Warning: Character voice profile is generic");
  });
});
