import { AiismBlacklist } from "../../domain/aiism-blacklist";
import { AiismDetector } from "../../domain/aiism-detector";
import { MruValidator } from "../../domain/mru-validator";

export interface ProseHighlight {
  start: number;
  end: number;
  text: string;
  category: string;
  tooltip: string;
  type: "aiism" | "mru";
}

export function analyzeProse(
  text: string,
  blacklist: AiismBlacklist = AiismBlacklist.default(),
): ProseHighlight[] {
  if (!text) return [];
  return [...aiismHighlights(text, blacklist), ...mruHighlights(text)];
}

function locate(text: string, snippet: string): number {
  return text.toLowerCase().indexOf(snippet.toLowerCase());
}

function aiismHighlights(
  text: string,
  blacklist: AiismBlacklist,
): ProseHighlight[] {
  const highlights: ProseHighlight[] = [];
  for (const finding of AiismDetector.scan(text, blacklist).findings) {
    const start = locate(text, finding.term);
    if (start === -1) continue;
    highlights.push({
      start,
      end: start + finding.term.length,
      text: finding.term,
      category: finding.category,
      tooltip: finding.reason,
      type: "aiism",
    });
  }
  return highlights;
}

function mruHighlights(text: string): ProseHighlight[] {
  const highlights: ProseHighlight[] = [];
  for (const violation of MruValidator.scan(text).violations) {
    const start = locate(text, violation.snippet);
    if (start === -1) continue;
    highlights.push({
      start,
      end: start + violation.snippet.length,
      text: violation.snippet,
      category: violation.type,
      tooltip: violation.suggestion,
      type: "mru",
    });
  }
  return highlights;
}
