/**
 * HeuristicDetector — OCP-friendly contract for lightweight prose heuristics
 * (as opposed to the full AuditAxis pipeline, which reasons over findings).
 * New detectors are added by implementing this interface, never by
 * modifying existing detectors.
 */
export interface DetectorAlert {
  level: "amarelo" | "laranja";
  message: string;
  excerpt?: string;
}

export interface HeuristicDetector {
  readonly id: string;
  detect(text: string): DetectorAlert[];
}
