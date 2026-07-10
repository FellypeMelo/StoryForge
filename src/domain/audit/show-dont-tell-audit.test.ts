import { describe, it, expect } from "vitest";
import { ShowDontTellAudit } from "./show-dont-tell-audit";
import { AuditAxis } from "./audit-report";

describe("ShowDontTellAudit", () => {
  it("returns no findings for empty prose", () => {
    expect(ShowDontTellAudit.run("")).toEqual([]);
  });

  it("flags a labeled emotion (Tell) via the existing MruValidator", () => {
    const findings = ShowDontTellAudit.run("Ela sentiu raiva quando viu a carta.");
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.every((f) => f.axis === AuditAxis.ShowDontTell)).toBe(true);
    expect(findings[0].severity).toBe("warning");
  });

  it("returns no findings for Show-compliant prose", () => {
    const findings = ShowDontTellAudit.run("Suas mãos tremeram. Ela recuou até a parede.");
    expect(findings).toEqual([]);
  });
});
