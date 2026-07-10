import { describe, it, expect } from "vitest";
import { CausationAudit } from "./causation-audit";
import { AuditAxis } from "./audit-report";
import { scene, sequel, outline } from "./test-helpers";

describe("CausationAudit", () => {
  it("returns no findings for an empty outline list", () => {
    expect(CausationAudit.run([])).toEqual([]);
  });

  it("flags a causal break between disconnected chapters via the existing StructuralErrorDetector", () => {
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

    const findings = CausationAudit.run([chapter1, chapter2]);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings.every((f) => f.axis === AuditAxis.Causation)).toBe(true);
    expect(findings.every((f) => f.severity === "warning")).toBe(true);
    expect(findings.some((f) => f.message.includes("Capítulo 2"))).toBe(true);
  });

  it("does not flag episodicity for chapters with clear causal continuity", () => {
    const chapter1 = outline(1, [
      scene("Encontra o anel amaldiçoado", "Guardião bloqueia passagem"),
      sequel("Assustada com o anel", "Resolve investigar o anel amaldiçoado"),
      scene("Investiga o anel amaldiçoado", "Pedras desabam atrás dela"),
    ]);
    const chapter2 = outline(2, [
      scene("Leva o anel amaldiçoado ao sábio", "Sábio recusa ajudar"),
      sequel("Determinada com o anel", "Resolve destruir o anel amaldiçoado"),
      scene("Ataca o anel amaldiçoado sozinha", "Anel resiste à destruição"),
    ]);

    const findings = CausationAudit.run([chapter1, chapter2]);
    const episodicity = findings.filter((f) => f.message.toLowerCase().includes("desconectad"));
    expect(episodicity.length).toBe(0);
  });
});
