import { AiismBlacklist, type BlacklistTerm } from "./aiism-blacklist";

export interface AiismFinding {
  term: string;
  category: BlacklistTerm["category"];
  reason: string;
}

export interface AiismScanResult {
  findings: AiismFinding[];
  menteAdverbCount: number;
  hasExcessiveMenteAdverbs: boolean;
}

export class AiismDetector {
  static readonly MENTE_THRESHOLD = 3;

  static scan(text: string, blacklist: AiismBlacklist): AiismScanResult {
    const lower = text.toLowerCase();
    const findings: AiismFinding[] = [];

    for (const entry of blacklist.terms) {
      if (lower.includes(entry.term.toLowerCase())) {
        findings.push({
          term: entry.term,
          category: entry.category,
          reason: entry.reason,
        });
      }
    }

    const menteRegex = /\b\w+mente\b/gi;
    const menteMatches = text.match(menteRegex);
    const menteCount = menteMatches ? menteMatches.length : 0;

    return {
      findings,
      menteAdverbCount: menteCount,
      hasExcessiveMenteAdverbs: menteCount > this.MENTE_THRESHOLD,
    };
  }
}
