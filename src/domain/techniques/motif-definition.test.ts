import { describe, it, expect } from "vitest";
import { MotifDefinition } from "./motif-definition";

describe("MotifDefinition", () => {
  it("creates a valid motif definition", () => {
    const motif = MotifDefinition.create({
      object: "um relógio quebrado",
      associatedWound: "abandono na infância",
      frequencyCurve: "linear",
    });

    expect(motif.object).toBe("um relógio quebrado");
    expect(motif.associatedWound).toBe("abandono na infância");
    expect(motif.frequencyCurve).toBe("linear");
  });

  it("throws when object is empty", () => {
    expect(() =>
      MotifDefinition.create({
        object: "   ",
        associatedWound: "abandono na infância",
        frequencyCurve: "linear",
      }),
    ).toThrow();
  });

  it("throws when associatedWound is empty", () => {
    expect(() =>
      MotifDefinition.create({
        object: "um relógio quebrado",
        associatedWound: "",
        frequencyCurve: "linear",
      }),
    ).toThrow();
  });

  describe("frequencyAt", () => {
    it("linear curve scales proportionally with progress", () => {
      const motif = MotifDefinition.create({
        object: "um relógio quebrado",
        associatedWound: "abandono na infância",
        frequencyCurve: "linear",
      });

      expect(motif.frequencyAt(0)).toBe(0);
      expect(motif.frequencyAt(0.5)).toBeCloseTo(0.5);
      expect(motif.frequencyAt(1)).toBe(1);
    });

    it("escalating curve rises faster near progress = 1", () => {
      const motif = MotifDefinition.create({
        object: "um relógio quebrado",
        associatedWound: "abandono na infância",
        frequencyCurve: "escalating",
      });

      expect(motif.frequencyAt(0)).toBe(0);
      expect(motif.frequencyAt(1)).toBe(1);

      // Escalating should lag behind linear early on...
      expect(motif.frequencyAt(0.5)).toBeLessThan(0.5);

      // ...but accelerate (larger delta) as progress approaches confrontation (1).
      const earlyDelta = motif.frequencyAt(0.2) - motif.frequencyAt(0);
      const lateDelta = motif.frequencyAt(1) - motif.frequencyAt(0.8);
      expect(lateDelta).toBeGreaterThan(earlyDelta);
    });

    it("clamps out-of-range progress gracefully", () => {
      const motif = MotifDefinition.create({
        object: "um relógio quebrado",
        associatedWound: "abandono na infância",
        frequencyCurve: "linear",
      });

      expect(motif.frequencyAt(-1)).toBe(0);
      expect(motif.frequencyAt(2)).toBe(1);
    });
  });
});
