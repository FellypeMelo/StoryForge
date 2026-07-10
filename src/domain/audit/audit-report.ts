/**
 * Bad Cop Editor — shared audit domain types.
 * Findings are non-blocking and purely informative; they never halt
 * generation or editing, only surface macro problems for the writer.
 */
export enum AuditAxis {
  Causation = "causation",
  Agency = "agency",
  ShowDontTell = "show_dont_tell",
  AntiPattern = "anti_pattern",
}

export type AuditSeverity = "info" | "warning";

export interface AuditFinding {
  axis: AuditAxis;
  severity: AuditSeverity;
  message: string;
}

export interface AuditReport {
  findings: AuditFinding[];
  /** Top 3 macro problems, warning-first, numbered by BadCopPipeline. */
  actionPlan: string[];
}
