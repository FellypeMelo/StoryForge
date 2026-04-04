import { describe, it, expect } from "vitest";
import {
  StructuralErrorDetector,
  ChapterData,
} from "./structural-errors";

describe("StructuralErrorDetector", () => {
  describe("Sagging Middle", () => {
    it("detects sagging middle — reflections without progression", () => {
      const chapters: ChapterData[] = [
        {
          beats: [
            { type: "scene" as const, summary: "Fights villain" },
            { type: "sequel" as const, summary: "Plans next move" },
          ],
          chapterNumber: 1,
        },
        {
          beats: [
            { type: "sequel" as const, summary: "Thinks about life" },
            { type: "sequel" as const, summary: "Remembers childhood trauma" },
            { type: "sequel" as const, summary: "Contemplates the nature of love and loss" },
          ],
          chapterNumber: 5,
        },
        {
          beats: [
            { type: "scene" as const, summary: "Final battle with villain" },
            { type: "sequel" as const, summary: "Aftermath" },
          ],
          chapterNumber: 10,
        },
      ];

      const errors = StructuralErrorDetector.detect(chapters);
      const sagging = errors.filter(
        (e) => e.type.value === "sagging-middle"
      );
      expect(sagging.length).toBeGreaterThan(0);
      expect(sagging.some((e) => e.chapterRef === 5)).toBe(true);
    });

    it("does not flag balanced middle", () => {
      const chapters: ChapterData[] = [
        {
          beats: [
            { type: "scene" as const, summary: "Fights dragon" },
            { type: "sequel" as const, summary: "Plans next move" },
          ],
          chapterNumber: 1,
        },
        {
          beats: [
            { type: "scene" as const, summary: "Confronts ally" },
            { type: "sequel" as const, summary: "Decides to trust" },
          ],
          chapterNumber: 5,
        },
        {
          beats: [
            { type: "scene" as const, summary: "Final battle" },
            { type: "sequel" as const, summary: "Aftermath" },
          ],
          chapterNumber: 10,
        },
      ];

      const errors = StructuralErrorDetector.detect(chapters);
      const sagging = errors.filter(
        (e) => e.type.value === "sagging-middle"
      );
      expect(sagging.length).toBe(0);
    });
  });

  describe("Early Resolution", () => {
    it("detects conflict resolved before Act 3", () => {
      const chapters: ChapterData[] = [
        {
          beats: [
            { type: "scene" as const, summary: "Fights villain" },
            { type: "sequel" as const, summary: "Villain surrenders unconditionally" },
          ],
          chapterNumber: 3,
        },
        {
          beats: [
            { type: "sequel" as const, summary: "Everyone celebrates the victory" },
          ],
          chapterNumber: 4,
        },
        {
          beats: [
            { type: "scene" as const, summary: "Aftermath reflection" },
          ],
          chapterNumber: 8,
        },
      ];

      const errors = StructuralErrorDetector.detect(chapters);
      const early = errors.filter(
        (e) => e.type.value === "early-resolution"
      );
      expect(early.length).toBeGreaterThan(0);
    });
  });

  describe("Episodicity", () => {
    it("detects disconnected events between chapters", () => {
      const chapters: ChapterData[] = [
        {
          beats: [
            { type: "scene" as const, summary: "Finds a mysterious ring with strange properties" },
          ],
          chapterNumber: 1,
        },
        {
          beats: [
            { type: "scene" as const, summary: "Goes to a local bakery for celebration" },
          ],
          chapterNumber: 2,
        },
        {
          beats: [
            { type: "scene" as const, summary: "Watches a parade downtown for entertainment" },
          ],
          chapterNumber: 3,
        },
      ];

      const errors = StructuralErrorDetector.detect(chapters);
      const episodic = errors.filter(
        (e) => e.type.value === "episodicity"
      );
      expect(episodic.length).toBeGreaterThan(0);
    });

    it("does not flag connected chapters", () => {
      const chapters: ChapterData[] = [
        {
          beats: [
            { type: "scene" as const, summary: "Finds the mysterious ring with cursed properties" },
            { type: "sequel" as const, summary: "Discovers the mysterious cursed ring is dangerous" },
          ],
          chapterNumber: 1,
        },
        {
          beats: [
            { type: "scene" as const, summary: "The mysterious cursed ring affects the hero badly" },
            { type: "sequel" as const, summary: "Decides to destroy the mysterious ring immediately" },
          ],
          chapterNumber: 2,
        },
      ];

      const errors = StructuralErrorDetector.detect(chapters);
      const episodic = errors.filter(
        (e) => e.type.value === "episodicity"
      );
      expect(episodic.length).toBe(0);
    });
  });
});
