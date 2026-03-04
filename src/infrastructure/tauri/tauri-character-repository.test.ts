import { describe, it, expect, vi } from "vitest";
import { TauriCharacterRepository } from "./tauri-character-repository";
import { CharacterSheet } from "../../domain/character-sheet";
import { CharacterId } from "../../domain/value-objects/character-id";
import { ProjectId } from "../../domain/value-objects/project-id";
import { OceanProfile, OceanTraitScore } from "../../domain/ocean-profile";
import { VoiceProfile, PhysicalTells } from "../../domain/voice-profile";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";

describe("TauriCharacterRepository", () => {
  const repo = new TauriCharacterRepository();

  it("should save a character sheet", async () => {
    const sheet = CharacterSheet.create({
      id: CharacterId.generate(),
      projectId: ProjectId.generate(),
      name: "Test",
      ocean: OceanProfile.create({
        openness: OceanTraitScore.High,
        conscientiousness: OceanTraitScore.High,
        extraversion: OceanTraitScore.High,
        agreeableness: OceanTraitScore.High,
        neuroticism: OceanTraitScore.High,
      }),
      voice: VoiceProfile.create({
        sentenceLength: "Short",
        formality: "Casual",
        verbalTics: [],
        evasionMechanism: "None",
      }),
      tells: PhysicalTells.create(["T1", "T2", "T3"]),
    });

    (invoke as any).mockResolvedValue(undefined);

    const result = await repo.save(sheet);

    expect(result.success).toBe(true);
    expect(invoke).toHaveBeenCalledWith("create_character", expect.objectContaining({
      character: expect.objectContaining({
        name: "Test",
        hauge_wound: "",
      })
    }));
  });

  it("should find a character by id", async () => {
    const charId = "550e8400-e29b-41d4-a716-446655440000";
    const projId = "550e8400-e29b-41d4-a716-446655440001";
    const mockData = {
      id: charId,
      project_id: projId,
      name: "Hero",
      ocean_scores: {
        openness: 80,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50,
      },
      hauge_wound: "W",
      hauge_belief: "B",
      hauge_fear: "F",
      hauge_identity: "I",
      hauge_essence: "E",
      voice_sentence_length: "Short",
      voice_formality: "Casual",
      voice_verbal_tics: "[]",
      voice_evasion_mechanism: "None",
      physical_tells: '["T1", "T2", "T3"]',
    };

    (invoke as any).mockResolvedValue(mockData);

    const result = await repo.findById(CharacterId.create(charId));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Hero");
      expect(result.data.ocean.openness).toBe(OceanTraitScore.High);
      expect(result.data.hauge?.identity).toBe("I");
    }
  });
});
