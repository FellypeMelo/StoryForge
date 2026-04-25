import { describe, it, expect } from "vitest";
import { PointOfView } from "./point-of-view";

describe("PointOfView", () => {
  it("creates first person POV", () => {
    const pov = PointOfView.create("first-person");
    expect(pov.value).toBe("first-person");
    expect(pov.label).toBe("Primeira Pessoa");
    expect(pov.toString()).toBe("Eu");
  });

  it("creates third person limited POV", () => {
    const pov = PointOfView.create("third-limited");
    expect(pov.value).toBe("third-limited");
    expect(pov.label).toBe("Terceira Pessoa Limitada");
  });

  it("creates third person omniscient POV", () => {
    const pov = PointOfView.create("third-omniscient");
    expect(pov.value).toBe("third-omniscient");
    expect(pov.label).toBe("Terceira Pessoa Onisciente");
  });

  it("throws on invalid POV", () => {
    expect(() => PointOfView.create("invalid" as any)).toThrow();
  });

  it("throws on empty value", () => {
    expect(() => PointOfView.create("" as any)).toThrow();
  });
});
