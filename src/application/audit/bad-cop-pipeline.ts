import { ChapterOutline } from "../../domain/chapter-outline";
import { AuditFinding, AuditReport } from "../../domain/audit/audit-report";
import { CausationAudit } from "../../domain/audit/causation-audit";
import { AgencyAudit } from "../../domain/audit/agency-audit";
import { ShowDontTellAudit } from "../../domain/audit/show-dont-tell-audit";
import { AntiPatternAudit } from "../../domain/audit/anti-pattern-audit";

const MAX_ACTION_PLAN_ITEMS = 3;

export interface BadCopPipelineInput {
  outlines?: ChapterOutline[];
  prose?: string;
}

/**
 * BadCopPipeline — orchestrates the 4 audit axes over whatever input is
 * present. Structure axes (Causation, Agency) need outlines; prose axes
 * (ShowDontTell, AntiPattern) need prose. Missing input is skipped, not
 * an error.
 */
export class BadCopPipeline {
  static run(input: BadCopPipelineInput): AuditReport {
    const findings = [...structureFindings(input.outlines), ...proseFindings(input.prose)];
    return { findings, actionPlan: buildActionPlan(findings) };
  }
}

function structureFindings(outlines?: ChapterOutline[]): AuditFinding[] {
  if (!outlines || outlines.length === 0) return [];
  return [...CausationAudit.run(outlines), ...AgencyAudit.run(outlines)];
}

function proseFindings(prose?: string): AuditFinding[] {
  if (!prose || !prose.trim()) return [];
  return [...ShowDontTellAudit.run(prose), ...AntiPatternAudit.run(prose)];
}

function buildActionPlan(findings: AuditFinding[]): string[] {
  return [...findings]
    .sort(byWarningFirst)
    .slice(0, MAX_ACTION_PLAN_ITEMS)
    .map((finding, index) => `${index + 1}. ${finding.message}`);
}

function byWarningFirst(a: AuditFinding, b: AuditFinding): number {
  const rank = (f: AuditFinding) => (f.severity === "warning" ? 0 : 1);
  return rank(a) - rank(b);
}
