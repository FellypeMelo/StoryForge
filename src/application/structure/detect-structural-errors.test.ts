import { describe, it, expect } from "vitest";
import { DetectStructuralErrorsUseCase } from "./detect-structural-errors";

describe("DetectStructuralErrorsUseCase", () => {
  it("returns empty array for well-structured story", () => {
    const useCase = new DetectStructuralErrorsUseCase();

    const chapters = Array.from({ length: 8 }, (_, i) => ({
      beats: [
        { type: "scene" as const, summary: "Action in chapter " + (i + 1) },
        { type: "sequel" as const, summary: "Reaction in chapter " + (i + 1) },
      ],
      chapterNumber: i + 1,
    }));

    const errors = useCase.execute(chapters);
    expect(errors).toHaveLength(0);
  });

  it("detects sagging middle when there are 8+ chapters", () => {
    const useCase = new DetectStructuralErrorsUseCase();

    const chapters = [
      { beats: [{ type: "scene" as const, summary: "Fight scene" }], chapterNumber: 1 },
      { beats: [{ type: "scene" as const, summary: "Journey through forest" }], chapterNumber: 2 },
      { beats: [{ type: "sequel" as const, summary: "Thinks about life" }, { type: "sequel" as const, summary: "Remembers childhood trauma" }, { type: "sequel" as const, summary: "Contemplates love and loss" }], chapterNumber: 3 },
      { beats: [{ type: "sequel" as const, summary: "Philosophizes on death" }, { type: "sequel" as const, summary: "Meditates about purpose" }, { type: "sequel" as const, summary: "Reflects on past mistakes" }], chapterNumber: 4 },
      { beats: [{ type: "sequel" as const, summary: "Dreams about future" }, { type: "sequel" as const, summary: "Nostalgia for times" }, { type: "sequel" as const, summary: "Contemplates existence" }], chapterNumber: 5 },
      { beats: [{ type: "sequel" as const, summary: "Thinks about meaning" }, { type: "sequel" as const, summary: "Reflects on journey" }, { type: "sequel" as const, summary: "Ponders philosophy" }], chapterNumber: 6 },
      { beats: [{ type: "scene" as const, summary: "Battle sequence" }], chapterNumber: 7 },
      { beats: [{ type: "scene" as const, summary: "Final confrontation" }], chapterNumber: 8 },
    ];

    const errors = useCase.execute(chapters);
    const sagging = errors.filter((e) => e.type.value === "sagging-middle");
    expect(sagging.length).toBeGreaterThan(0);
  });
});
