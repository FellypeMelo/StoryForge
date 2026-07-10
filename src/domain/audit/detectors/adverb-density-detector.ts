import { AiismBlacklist } from "../../aiism-blacklist";
import { AiismDetector } from "../../aiism-detector";
import { DetectorAlert, HeuristicDetector } from "./heuristic-detector";

const DEFAULT_THRESHOLD = 3;

/**
 * AdverbDensityDetector — flags paragraphs with heavy "-mente" adverb
 * density. Reuses AiismDetector's mente-counting logic per paragraph
 * instead of reimplementing the regex.
 */
export class AdverbDensityDetector implements HeuristicDetector {
  readonly id = "adverb-density";

  constructor(private readonly threshold: number = DEFAULT_THRESHOLD) {}

  detect(text: string): DetectorAlert[] {
    if (!text || !text.trim()) return [];
    return splitParagraphs(text).flatMap((p, i) => this.checkParagraph(p, i + 1));
  }

  private checkParagraph(paragraph: string, position: number): DetectorAlert[] {
    const count = countMenteAdverbs(paragraph);
    if (count >= this.threshold) return [this.alert("laranja", paragraph, position, count)];
    if (count === this.threshold - 1) return [this.alert("amarelo", paragraph, position, count)];
    return [];
  }

  private alert(
    level: DetectorAlert["level"],
    paragraph: string,
    position: number,
    count: number,
  ): DetectorAlert {
    const verdict = level === "laranja" ? "excesso pode enfraquecer a prosa" : "próximo do limite recomendado";
    return {
      level,
      message: `Parágrafo ${position}: ${count} advérbios em "-mente" — ${verdict}.`,
      excerpt: paragraph.slice(0, 60),
    };
  }
}

function splitParagraphs(text: string): string[] {
  return text
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
}

function countMenteAdverbs(paragraph: string): number {
  return AiismDetector.scan(paragraph, AiismBlacklist.empty()).menteAdverbCount;
}
