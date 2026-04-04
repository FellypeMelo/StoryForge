import { describe, it, expect } from "vitest";
import { NarrativeFramework, BEATS_MAP } from "./narrative-framework";

describe("NarrativeFramework", () => {
  it("defines exactly 6 frameworks", () => {
    const values = NarrativeFramework.all();
    expect(values).toHaveLength(6);
  });

  it("has all expected framework names", () => {
    const names = NarrativeFramework.all().map((f) => f.name);
    expect(names).toContain("Jornada do Heroi");
    expect(names).toContain("Save the Cat");
    expect(names).toContain("Curva Fichteana");
    expect(names).toContain("Estrutura de 7 Pontos");
    expect(names).toContain("Kishotenketsu");
    expect(names).toContain("Não-linear");
  });

  it("Hero's Journey has 12 stages", () => {
    const fw = NarrativeFramework.HeroesJourney();
    const beats = BEATS_MAP[fw.name];
    expect(beats).toHaveLength(12);
  });

  it("Save the Cat has 15 beats", () => {
    const fw = NarrativeFramework.SaveTheCat();
    const beats = BEATS_MAP[fw.name];
    expect(beats).toHaveLength(15);
  });

  it("Kishotenketsu has 4 acts", () => {
    const fw = NarrativeFramework.Kishotenketsu();
    const beats = BEATS_MAP[fw.name];
    expect(beats).toHaveLength(4);
  });

  it("Fichteana has 8 crises", () => {
    const fw = NarrativeFramework.Fichteana();
    const beats = BEATS_MAP[fw.name];
    expect(beats).toHaveLength(8);
  });

  it("7-Point Structure has 7 points", () => {
    const fw = NarrativeFramework.SevenPoint();
    const beats = BEATS_MAP[fw.name];
    expect(beats).toHaveLength(7);
  });

  it("NonLinear has 6 temporal markers", () => {
    const fw = NarrativeFramework.NonLinear();
    const beats = BEATS_MAP[fw.name];
    expect(beats).toHaveLength(6);
  });

  it("fromValue returns correct framework", () => {
    const fw = NarrativeFramework.fromValue("kishotenketsu");
    expect(fw?.name).toBe("Kishotenketsu");
  });

  it("fromValue returns null for unknown value", () => {
    expect(NarrativeFramework.fromValue("unknown")).toBeNull();
  });
});
