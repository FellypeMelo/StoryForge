import { ChapterOutline } from "../chapter-outline";
import { SceneBeat, DisasterType } from "../scene-beat";
import { SequelBeat } from "../sequel-beat";
import { Cliffhanger, CliffhangerType } from "../cliffhanger";
import { ChapterId } from "../value-objects/chapter-id";
import { ScenePolarity } from "../scene-grid";

/**
 * Shared ChapterOutline fixture builders for audit tests.
 * Not a test file itself — colocated here to avoid duplicating
 * ChapterOutline/SceneBeat/SequelBeat construction boilerplate
 * (min 4 beats incl. cliffhanger, valid dilemma markers) per test file.
 */

const DEFAULT_DILEMMA = [
  "Sacrificar o plano original (perda irreparável)",
  "Trair um aliado (culpa duradoura)",
];

export function scene(
  goal: string,
  conflict: string,
  disaster: DisasterType = DisasterType.No(),
): SceneBeat {
  return SceneBeat.create(goal, conflict, disaster);
}

export function sequel(
  reaction: string,
  decision: string,
  dilemma: string[] = DEFAULT_DILEMMA,
): SequelBeat {
  return SequelBeat.create(reaction, dilemma, decision);
}

export function outline(
  chapterNumber: number,
  beats: (SceneBeat | SequelBeat)[],
  cliffDescription = "Algo inesperado acontece",
  startPolarity: "positive" | "negative" = "positive",
  endPolarity: "positive" | "negative" = "negative",
): ChapterOutline {
  const cliff = Cliffhanger.create(CliffhangerType.PrePoint(), cliffDescription);
  return ChapterOutline.create(
    ChapterId.generate(),
    chapterNumber,
    beats,
    cliff,
    ScenePolarity.create(startPolarity),
    ScenePolarity.create(endPolarity),
  );
}
