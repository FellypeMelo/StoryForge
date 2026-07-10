import { MruValidator, MruViolation } from "../mru-validator";
import { AuditAxis, AuditFinding } from "./audit-report";

/**
 * ShowDontTellAudit — Bad Cop show-don't-tell axis.
 * Reuses the existing MruValidator (labeled-emotion "tell" detection)
 * instead of reimplementing prose analysis.
 */
export class ShowDontTellAudit {
  static run(prose: string): AuditFinding[] {
    if (!prose || !prose.trim()) return [];
    return MruValidator.scan(prose).violations.map(toFinding);
  }
}

function toFinding(violation: MruViolation): AuditFinding {
  return {
    axis: AuditAxis.ShowDontTell,
    severity: "warning",
    message: `"${violation.snippet}": ${violation.suggestion}`,
  };
}
