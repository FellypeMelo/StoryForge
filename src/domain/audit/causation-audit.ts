import { ChapterOutline } from "../chapter-outline";
import { SceneBeat } from "../scene-beat";
import { SequelBeat } from "../sequel-beat";
import { StructuralErrorDetector, StructuralError, ChapterData } from "../structural-errors";
import { AuditAxis, AuditFinding } from "./audit-report";

/**
 * CausationAudit — Bad Cop causation axis.
 * Reuses the existing StructuralErrorDetector (sagging middle, early
 * resolution, episodicity) instead of reimplementing causal analysis.
 */
export class CausationAudit {
  static run(outlines: ChapterOutline[]): AuditFinding[] {
    if (!outlines || outlines.length === 0) return [];
    const chapters = outlines.map(toChapterData);
    return StructuralErrorDetector.detect(chapters).map(toFinding);
  }
}

function toChapterData(outline: ChapterOutline): ChapterData {
  return {
    chapterNumber: outline.getChapterNumber(),
    beats: outline.getBeats().map(toBeatData),
  };
}

function toBeatData(beat: SceneBeat | SequelBeat): ChapterData["beats"][number] {
  if (beat instanceof SceneBeat) {
    return { type: "scene", summary: `${beat.goal} ${beat.conflict} ${beat.disaster.label}` };
  }
  return { type: "sequel", summary: `${beat.reaction} ${beat.decision}` };
}

function toFinding(error: StructuralError): AuditFinding {
  return { axis: AuditAxis.Causation, severity: "warning", message: error.message };
}
