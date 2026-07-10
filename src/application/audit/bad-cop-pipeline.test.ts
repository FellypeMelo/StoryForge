import { describe, it, expect } from "vitest";
import { BadCopPipeline } from "./bad-cop-pipeline";
import { AuditAxis } from "../../domain/audit/audit-report";
import { scene, sequel, outline } from "../../domain/audit/test-helpers";

describe("BadCopPipeline", () => {
  it("returns an empty report with an empty action plan when no input is given", () => {
    const report = BadCopPipeline.run({});
    expect(report.findings).toEqual([]);
    expect(report.actionPlan).toEqual([]);
  });

  it("runs only the structure axes when only outlines are given", () => {
    const chapter = outline(1, [scene("A", "B"), scene("C", "D"), scene("E", "F")]);

    const report = BadCopPipeline.run({ outlines: [chapter] });

    expect(report.findings.length).toBeGreaterThan(0);
    expect(
      report.findings.every(
        (f) => f.axis === AuditAxis.Agency || f.axis === AuditAxis.Causation,
      ),
    ).toBe(true);
  });

  it("runs only the prose axes when only prose is given", () => {
    const report = BadCopPipeline.run({
      prose: "Uma rica tapeçaria de sentimentos. Ela sentiu raiva.",
    });

    expect(report.findings.length).toBeGreaterThan(0);
    expect(
      report.findings.every(
        (f) => f.axis === AuditAxis.AntiPattern || f.axis === AuditAxis.ShowDontTell,
      ),
    ).toBe(true);
  });

  it("aggregates findings across ≥2 axes and builds a warning-first action plan capped at 3", () => {
    const chapter1 = outline(1, [
      scene("Encontra o anel amaldiçoado", "Guardião bloqueia passagem"),
      sequel("Frustração imensa", "Resolve esconder o anel amaldiçoado"),
      scene("Foge pelo túnel escuro", "Pedras desabam atrás dela"),
    ]);
    const chapter2 = outline(2, [
      scene("Prepara bolo delicioso", "Forno quebra inesperadamente"),
      sequel("Alegria contagiante", "Prefere comprar outro forno novo"),
      scene("Convida vizinhos festa", "Chuva atrapalha planos"),
    ]);
    const prose =
      "Uma rica tapeçaria de sentimentos envolveu a cidade. Ela sentiu raiva ao ler a carta.";

    const report = BadCopPipeline.run({ outlines: [chapter1, chapter2], prose });

    const axesTouched = new Set(report.findings.map((f) => f.axis));
    expect(axesTouched.size).toBeGreaterThanOrEqual(2);
    expect(report.actionPlan.length).toBeLessThanOrEqual(3);
    expect(report.actionPlan.length).toBeGreaterThan(0);
    expect(report.actionPlan[0]).toMatch(/^1\./);
  });
});
