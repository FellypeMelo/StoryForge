import { describe, it, expect } from "vitest";
import { AuditAxis } from "./audit-report";
import type { AuditFinding, AuditReport, AuditSeverity } from "./audit-report";

describe("AuditAxis", () => {
  it("exposes the four Bad Cop audit axes with stable string values", () => {
    expect(AuditAxis.Causation).toBe("causation");
    expect(AuditAxis.Agency).toBe("agency");
    expect(AuditAxis.ShowDontTell).toBe("show_dont_tell");
    expect(AuditAxis.AntiPattern).toBe("anti_pattern");
  });
});

describe("AuditFinding / AuditReport shape", () => {
  it("allows constructing a finding and report with the expected fields", () => {
    const severity: AuditSeverity = "warning";
    const finding: AuditFinding = {
      axis: AuditAxis.Causation,
      severity,
      message: "Quebra de causalidade entre capítulos.",
    };
    const report: AuditReport = {
      findings: [finding],
      actionPlan: ["1. Corrigir causalidade no capítulo 3."],
    };

    expect(report.findings).toHaveLength(1);
    expect(report.actionPlan).toHaveLength(1);
  });
});
