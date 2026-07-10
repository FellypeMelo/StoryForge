import { describe, it, expect } from "vitest";
import { AntiPatternAudit } from "./anti-pattern-audit";
import { AuditAxis } from "./audit-report";

describe("AntiPatternAudit", () => {
  it("returns no findings for empty prose", () => {
    expect(AntiPatternAudit.run("")).toEqual([]);
  });

  it("flags a blacklisted AI-ism via the existing AiismDetector", () => {
    const findings = AntiPatternAudit.run("Uma rica tapeçaria de sentimentos envolveu a cidade.");
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.every((f) => f.axis === AuditAxis.AntiPattern)).toBe(true);
  });

  it("flags excessive -mente adverb density", () => {
    const findings = AntiPatternAudit.run(
      "Ele caminhou lentamente, olhou tristemente, falou calmamente e sorriu docemente para todos.",
    );
    expect(findings.some((f) => f.message.toLowerCase().includes("mente"))).toBe(true);
  });

  it("returns no findings for clean text", () => {
    const findings = AntiPatternAudit.run("She walked through the garden. The roses were red.");
    expect(findings).toEqual([]);
  });
});
