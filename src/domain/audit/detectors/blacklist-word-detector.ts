import { AiismBlacklist } from "../../aiism-blacklist";
import { AiismDetector } from "../../aiism-detector";
import { DetectorAlert, HeuristicDetector } from "./heuristic-detector";

/**
 * BlacklistWordDetector — wraps the existing AiismDetector/AiismBlacklist
 * as a HeuristicDetector, instead of reimplementing blacklist matching.
 */
export class BlacklistWordDetector implements HeuristicDetector {
  readonly id = "blacklist-word";

  constructor(private readonly blacklist: AiismBlacklist = AiismBlacklist.default()) {}

  detect(text: string): DetectorAlert[] {
    if (!text || !text.trim()) return [];
    return AiismDetector.scan(text, this.blacklist).findings.map((finding) => ({
      level: "laranja" as const,
      message: `Termo de IA detectado (${finding.category}): "${finding.term}". ${finding.reason}`,
      excerpt: finding.term,
    }));
  }
}
