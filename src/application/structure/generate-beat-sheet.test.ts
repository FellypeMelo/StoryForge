import { describe, it, expect, vi } from "vitest";
import { GenerateBeatSheetUseCase, BeatSheetRequest } from "./generate-beat-sheet";
import { LlmPort } from "../../domain/ideation/ports/llm-port";
import { ChapterId } from "../../domain/value-objects/chapter-id";
import { NarrativeFramework } from "../../domain/narrative-framework";

function makeMockLlmPort(response: string): LlmPort {
  return {
    complete: vi.fn().mockResolvedValue({ text: response }),
  };
}

describe("GenerateBeatSheetUseCase", () => {
  it("generates beat sheet and returns successful result", async () => {
    const mockResponse = JSON.stringify({
      beats: [
        {
          type: "scene",
          goal: "Find the hidden map",
          conflict: "The library is on fire",
          disaster: "no-and-worse",
        },
        {
          type: "sequel",
          reaction: "Panics about losing the map and grandfather connection",
          dilemma: [
            "Run into the burning library and risk death",
            "Abandon the quest and fail everything forever",
            "Wait for firemen and lose the map to looters",
          ],
          decision: "Decides to run in with wet clothes",
        },
        {
          type: "scene",
          goal: "Search the burning shelves for clues",
          conflict: "Ceiling collapses blocking the exit",
          disaster: "yes-but",
        },
        {
          type: "sequel",
          reaction: "Terrified but desperate for answers",
          dilemma: [
            "Stay trapped and lose all hope forever",
            "Risk crushing injury to dig through rubble",
            "Sacrifice the clothes as torch and risk fire spread",
          ],
          decision: "Decides to dig through the rubble with bare hands",
        },
      ],
      cliffhanger: {
        type: "climactic",
        description: "Finds the map but realizes it is a fake",
      },
      startPolarity: "positive",
      endPolarity: "negative",
    });

    const llmPort = makeMockLlmPort(mockResponse);
    const useCase = new GenerateBeatSheetUseCase(llmPort);

    const request: BeatSheetRequest = {
      chapterId: ChapterId.generate(),
      chapterNumber: 1,
      context: {
        framework: NarrativeFramework.HeroesJourney(),
        previousChapterSummary: "Protagonist discovers the old library exists",
        protagonistName: "Elena",
        protagonistGoal: "Find her grandfather's map",
      },
    };

    const result = await useCase.execute(request);

    expect(result.outline.beatCount()).toBe(5); // 4 beats + 1 cliffhanger
    expect(result.outline.hasCliffhanger()).toBe(true);
    expect(result.isSuccess()).toBe(true);
  });

  it("throws when LLM returns unparseable response", async () => {
    const llmPort = makeMockLlmPort("not json");
    const useCase = new GenerateBeatSheetUseCase(llmPort);

    const request: BeatSheetRequest = {
      chapterId: ChapterId.generate(),
      chapterNumber: 1,
      context: {
        framework: NarrativeFramework.Kishotenketsu(),
        previousChapterSummary: "",
        protagonistName: "Test",
        protagonistGoal: "Goal",
      },
    };

    await expect(useCase.execute(request)).rejects.toThrow(
      "Failed to parse LLM response"
    );
  });

  it("throws when LLM returns empty response", async () => {
    const llmPort = makeMockLlmPort("");
    const useCase = new GenerateBeatSheetUseCase(llmPort);

    const request: BeatSheetRequest = {
      chapterId: ChapterId.generate(),
      chapterNumber: 1,
      context: {
        framework: NarrativeFramework.Kishotenketsu(),
        previousChapterSummary: "",
        protagonistName: "Test",
        protagonistGoal: "Goal",
      },
    };

    await expect(useCase.execute(request)).rejects.toThrow(
      "Empty response from LLM"
    );
  });
});
