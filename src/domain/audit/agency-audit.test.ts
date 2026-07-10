import { describe, it, expect } from "vitest";
import { AgencyAudit } from "./agency-audit";
import { AuditAxis } from "./audit-report";
import { scene, sequel, outline } from "./test-helpers";

describe("AgencyAudit", () => {
  it("returns no findings for an empty outline list", () => {
    expect(AgencyAudit.run([])).toEqual([]);
  });

  it("flags a chapter with zero Sequel beats as protagonist passivity", () => {
    const chapter = outline(1, [scene("A", "B"), scene("C", "D"), scene("E", "F")]);

    const findings = AgencyAudit.run([chapter]);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings.every((f) => f.axis === AuditAxis.Agency)).toBe(true);
    expect(findings.every((f) => f.severity === "warning")).toBe(true);
    expect(findings.some((f) => f.message.includes("Sequela"))).toBe(true);
  });

  it("flags a Scene disaster not followed by a Sequel beat", () => {
    const chapter = outline(1, [scene("A", "B"), scene("C", "D"), sequel("Reação", "Decisão")]);

    const findings = AgencyAudit.run([chapter]);

    expect(findings.some((f) => f.message.includes("desastre"))).toBe(true);
  });

  it("does not flag a chapter with proper Scene/Sequel alternation", () => {
    const chapter = outline(1, [
      scene("A", "B"),
      sequel("Reação 1", "Decisão 1"),
      scene("C", "D"),
      sequel("Reação 2", "Decisão 2"),
    ]);

    const findings = AgencyAudit.run([chapter]);

    expect(findings).toEqual([]);
  });
});
