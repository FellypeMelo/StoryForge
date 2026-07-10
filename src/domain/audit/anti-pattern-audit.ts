import { AiismBlacklist } from "../aiism-blacklist";
import { AiismDetector, AiismFinding, AiismScanResult } from "../aiism-detector";
import { AuditAxis, AuditFinding } from "./audit-report";

/**
 * AntiPatternAudit — Bad Cop anti-pattern axis.
 * Reuses the existing AiismDetector/AiismBlacklist instead of
 * reimplementing AI-ism / cliché detection.
 */
export class AntiPatternAudit {
  static run(prose: string): AuditFinding[] {
    if (!prose || !prose.trim()) return [];
    const scan = AiismDetector.scan(prose, AiismBlacklist.default());
    return [...scan.findings.map(toFinding), ...menteFinding(scan)];
  }
}

function toFinding(finding: AiismFinding): AuditFinding {
  return {
    axis: AuditAxis.AntiPattern,
    severity: "warning",
    message: `Termo de IA detectado (${finding.category}): "${finding.term}". ${finding.reason}`,
  };
}

function menteFinding(scan: AiismScanResult): AuditFinding[] {
  if (!scan.hasExcessiveMenteAdverbs) return [];
  return [
    {
      axis: AuditAxis.AntiPattern,
      severity: "warning",
      message: `Excesso de advérbios em "-mente" (${scan.menteAdverbCount} ocorrências) — sinal de prosa robótica.`,
    },
  ];
}
