import { ChapterOutline } from "../../../domain/chapter-outline";
import { SceneBeat } from "../../../domain/scene-beat";
import { ChapterData } from "../../../domain/structural-errors";

/** Adapta o agregado ChapterOutline ao formato do detector de erros estruturais. */
export function toChapterData(outline: ChapterOutline): ChapterData {
  return {
    chapterNumber: outline.getChapterNumber(),
    beats: outline.getBeats().map((beat) =>
      beat instanceof SceneBeat
        ? { type: "scene" as const, summary: `${beat.goal}. ${beat.conflict}` }
        : { type: "sequel" as const, summary: `${beat.reaction}. ${beat.decision}` },
    ),
  };
}
