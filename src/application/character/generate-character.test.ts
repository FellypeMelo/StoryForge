import { describe, it, expect, vi } from "vitest";
import { GenerateCharacterUseCase } from "./generate-character";
import { LlmPort } from "../../domain/ideation/ports/llm-port";
import { Premise } from "../../domain/ideation/premise";
import { CharacterRepository } from "../../domain/ports/character-repository";
import { ProjectId } from "../../domain/value-objects/project-id";

describe("GenerateCharacterUseCase", () => {
  const mockLlmPort: LlmPort = {
    complete: vi.fn().mockResolvedValue({
      text: JSON.stringify({
        ocean: {
          openness: "High",
          conscientiousness: "Medium",
          extraversion: "Low",
          agreeableness: "High",
          neuroticism: "Medium",
        },
        hauge: {
          wound: "Lost everything",
          belief: "I must be alone",
          fear: "Vulnerability",
          identity: "The Hermit",
          essence: "The Guardian",
        },
        voice: {
          sentenceLength: "Short",
          formality: "Casual",
          verbalTics: ["um", "err"],
          evasionMechanism: "Sarcasm",
        },
        tells: ["Fixed stare", "Clenched jaw", "Tapping foot"],
      }),
    }),
  };

  const mockRepo: CharacterRepository = {
    save: vi.fn().mockResolvedValue({ success: true, data: undefined }),
    findById: vi.fn(),
    findByProject: vi.fn(),
    delete: vi.fn(),
  };

  it("should generate and save a CharacterSheet from a premise and role", async () => {
    const useCase = new GenerateCharacterUseCase(mockLlmPort, mockRepo);
    const projectId = ProjectId.generate();
    const premise = new Premise("A lonely spacer", "Finds a mysterious artifact", "Space pirates", "The fate of the sector");
    
    const characterSheet = await useCase.execute(projectId, "John Doe", premise, "Protagonist");

    expect(characterSheet.isComplete()).toBe(true);
    expect(characterSheet.name).toBe("John Doe");
    expect(characterSheet.projectId.equals(projectId)).toBe(true);
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it("should throw error if LLM returns invalid JSON", async () => {
    const useCase = new GenerateCharacterUseCase(mockLlmPort, mockRepo);
    const projectId = ProjectId.generate();
    const premise = new Premise("Protagonist", "Inciting Incident", "Antagonist", "Detailed stakes that are long enough");

    mockLlmPort.complete = vi.fn().mockResolvedValue({ text: "invalid json" });

    await expect(useCase.execute(projectId, "Test", premise, "Protagonist")).rejects.toThrow("Failed to parse character from LLM");
  });
});
