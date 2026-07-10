import { DetectorAlert, HeuristicDetector } from "./heuristic-detector";

const OPENING_WORD_COUNT = 2;

/**
 * RepetitionDetector — flags consecutive paragraphs that open with the
 * same word(s), a common sign of monotonous rhythm.
 */
export class RepetitionDetector implements HeuristicDetector {
  readonly id = "repetition";

  detect(text: string): DetectorAlert[] {
    if (!text || !text.trim()) return [];
    const paragraphs = splitParagraphs(text);
    return paragraphs.slice(1).flatMap((paragraph, i) => this.checkPair(paragraphs[i], paragraph));
  }

  private checkPair(previous: string, current: string): DetectorAlert[] {
    const opening = openingWords(current);
    if (!opening || opening !== openingWords(previous)) return [];
    return [
      {
        level: "amarelo",
        message: `Parágrafos consecutivos começam com "${opening}" — varie a abertura para evitar repetição.`,
        excerpt: current.slice(0, 40),
      },
    ];
  }
}

function splitParagraphs(text: string): string[] {
  return text
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
}

function openingWords(paragraph: string): string {
  return paragraph.toLowerCase().split(/\s+/).slice(0, OPENING_WORD_COUNT).join(" ");
}
