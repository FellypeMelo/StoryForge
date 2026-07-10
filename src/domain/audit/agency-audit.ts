import { ChapterOutline } from "../chapter-outline";
import { SceneBeat } from "../scene-beat";
import { SequelBeat } from "../sequel-beat";
import { AuditAxis, AuditFinding } from "./audit-report";

/**
 * AgencyAudit — Bad Cop agency axis (genuinely new detection).
 * Flags a passive protagonist: a Scene disaster never followed by a
 * Sequel (no Reação/Decisão → no agency), or a chapter with zero Sequels.
 */
export class AgencyAudit {
  static run(outlines: ChapterOutline[]): AuditFinding[] {
    if (!outlines || outlines.length === 0) return [];
    return outlines.flatMap(findPassivityInChapter);
  }
}

function findPassivityInChapter(outline: ChapterOutline): AuditFinding[] {
  const beats = outline.getBeats();
  const chapterNumber = outline.getChapterNumber();
  const findings: AuditFinding[] = [];

  if (!beats.some((b) => b instanceof SequelBeat)) {
    findings.push(zeroSequelFinding(chapterNumber));
  }
  findings.push(...danglingDisasterFindings(beats, chapterNumber));
  return findings;
}

function zeroSequelFinding(chapterNumber: number): AuditFinding {
  return {
    axis: AuditAxis.Agency,
    severity: "warning",
    message: `Capítulo ${chapterNumber}: nenhuma Sequela (Reação/Decisão) presente — o protagonista nunca processa nem decide, apenas sofre os eventos.`,
  };
}

function danglingDisasterFindings(
  beats: (SceneBeat | SequelBeat)[],
  chapterNumber: number,
): AuditFinding[] {
  return beats
    .map((beat, i) => ({ beat, next: beats[i + 1], position: i + 1 }))
    .filter(({ beat, next }) => beat instanceof SceneBeat && !(next instanceof SequelBeat))
    .map(({ position }) => danglingDisasterFinding(chapterNumber, position));
}

function danglingDisasterFinding(chapterNumber: number, position: number): AuditFinding {
  return {
    axis: AuditAxis.Agency,
    severity: "warning",
    message: `Capítulo ${chapterNumber}, beat ${position}: o desastre da cena não é seguido por uma Sequela — falta Reação/Decisão, o protagonista fica passivo diante do revés.`,
  };
}
