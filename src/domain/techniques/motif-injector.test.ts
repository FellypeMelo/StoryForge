import { describe, it, expect } from "vitest";
import { MotifInjector } from "./motif-injector";
import { MotifDefinition } from "./motif-definition";

describe("MotifInjector", () => {
  const motif = MotifDefinition.create({
    object: "um relógio quebrado",
    associatedWound: "abandono na infância",
    frequencyCurve: "linear",
  });

  it("injects a peripheral symbolic fragment at high progress", () => {
    const base = "Escreva a cena do confronto final.";
    const injected = MotifInjector.inject(base, motif, 0.9);

    expect(injected).toContain(base);
    expect(injected).not.toBe(base);
    expect(injected).toContain("um relógio quebrado");
    expect(injected.toLowerCase()).toContain("periferia");
    expect(injected.toLowerCase()).toContain("nunca");
  });

  it("does not inject anything below the progress threshold", () => {
    const base = "Escreva a cena de abertura.";
    const injected = MotifInjector.inject(base, motif, 0.05);

    expect(injected).toBe(base);
  });

  it("does not inject anything at progress zero", () => {
    const base = "Escreva a cena de abertura.";
    const injected = MotifInjector.inject(base, motif, 0);

    expect(injected).toBe(base);
  });

  it("respects the escalating curve when deciding whether to inject", () => {
    const escalatingMotif = MotifDefinition.create({
      object: "uma boneca sem olhos",
      associatedWound: "perda da mãe",
      frequencyCurve: "escalating",
    });

    // frequencyAt(0.3) for escalating (0.09) is below threshold even though
    // the same progress on a linear curve (0.3) would trigger an injection.
    const injected = MotifInjector.inject("Cena intermediária.", escalatingMotif, 0.3);
    expect(injected).toBe("Cena intermediária.");
  });

  it("degrades gracefully on empty base prompt", () => {
    const injected = MotifInjector.inject("", motif, 0.9);
    expect(() => injected).not.toThrow();
    expect(injected).toContain("um relógio quebrado");
  });
});
