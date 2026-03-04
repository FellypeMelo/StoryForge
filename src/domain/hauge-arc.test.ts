import { describe, it, expect } from "vitest";
import { HaugeArc } from "./hauge-arc";

describe("HaugeArc", () => {
  it("should create a valid HaugeArc", () => {
    const arc = HaugeArc.create({
      wound: "Abandoned as a child",
      belief: "I am only safe when I am in control",
      fear: "Losing control and being hurt",
      identity: "The Control Freak",
      essence: "Vulnerable Leader",
    });

    expect(arc.wound).toBe("Abandoned as a child");
    expect(arc.identity).toBe("The Control Freak");
    expect(arc.essence).toBe("Vulnerable Leader");
  });

  it("should fail if identity and essence are the same", () => {
    expect(() => {
      HaugeArc.create({
        wound: "Any wound",
        belief: "Any belief",
        fear: "Any fear",
        identity: "The Same",
        essence: "The Same",
      });
    }).toThrow("Identity and Essence must be in opposition");
  });
});
