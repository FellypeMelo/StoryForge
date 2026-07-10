import { describe, it, expect } from "vitest";
import { AdverbDensityDetector } from "./adverb-density-detector";

describe("AdverbDensityDetector", () => {
  it("has a stable id", () => {
    expect(new AdverbDensityDetector().id).toBe("adverb-density");
  });

  it("flags laranja when a paragraph exceeds the default threshold", () => {
    const text =
      "Ele caminhou lentamente, olhou tristemente, falou calmamente e sorriu docemente.";
    const alerts = new AdverbDensityDetector().detect(text);
    expect(alerts.some((a) => a.level === "laranja")).toBe(true);
  });

  it("flags amarelo when a paragraph is one below the default threshold", () => {
    const text = "Ele caminhou lentamente e olhou tristemente.";
    const alerts = new AdverbDensityDetector().detect(text);
    expect(alerts.some((a) => a.level === "amarelo")).toBe(true);
  });

  it("respects a custom threshold", () => {
    const text = "Ele caminhou lentamente e olhou tristemente.";
    const alerts = new AdverbDensityDetector(2).detect(text);
    expect(alerts.some((a) => a.level === "laranja")).toBe(true);
  });

  it("returns no alerts for clean paragraphs", () => {
    const alerts = new AdverbDensityDetector().detect("Ela correu rápido pela rua escura.");
    expect(alerts).toEqual([]);
  });

  it("returns no alerts for empty text", () => {
    expect(new AdverbDensityDetector().detect("")).toEqual([]);
  });
});
