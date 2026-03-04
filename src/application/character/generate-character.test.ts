import { describe, it, expect, vi } from "vitest";
import { GenerateCharacterUseCase } from "./generate-character";
import { LlmPort } from "../../domain/ideation/ports/llm-port";
import { Premise } from "../../domain/ideation/premise";

describe("GenerateCharacterUseCase", () => {
  it("should generate a CharacterSheet from a premise and role", async () => {
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

    const useCase = new GenerateCharacterUseCase(mockLlmPort);
    const premise = new Premise("A lonely spacer", "Finds a mysterious artifact", "Space pirates", "The fate of the sector");
    
    const characterSheet = await useCase.execute(premise, "Protagonist");

    expect(characterSheet.isComplete()).toBe(true);
    expect(characterSheet.ocean.openness).toBe("High");
    expect(characterSheet.hauge?.identity).toBe("The Hermit");
    expect(characterSheet.voice.sentenceLength).toBe("Short");
    expect(characterSheet.tells.list).toContain("Fixed stare");
  });

  it("should throw error if LLM returns invalid JSON", async () => {
    const mockLlmPort: LlmPort = {
      complete: vi.fn().mockResolvedValue({ text: "invalid json" }),
    };

    const useCase = new GenerateCharacterUseCase(mockLlmPort);
    const premise = new Premise("Protagonist", "Inciting Incident", "Antagonist", "Detailed stakes that are long enough");

    await expect(useCase.execute(premise, "Protagonist")).rejects.toThrow("Failed to parse character from LLM");
  });
});
