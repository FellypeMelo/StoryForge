import { describe, it, expect } from "vitest";
import { RepetitionDetector } from "./repetition-detector";

describe("RepetitionDetector", () => {
  it("has a stable id", () => {
    expect(new RepetitionDetector().id).toBe("repetition");
  });

  it("flags consecutive paragraphs with the same opening words", () => {
    const text = "Ela correu pela rua.\nEla correu até a praça.\nO sol brilhava forte.";
    const alerts = new RepetitionDetector().detect(text);
    expect(alerts.length).toBe(1);
    expect(alerts[0].level).toBe("amarelo");
  });

  it("does not flag paragraphs with varied openings", () => {
    const text = "Ela correu pela rua.\nO sol brilhava forte.\nSilêncio tomou conta.";
    const alerts = new RepetitionDetector().detect(text);
    expect(alerts).toEqual([]);
  });

  it("returns no alerts for empty text", () => {
    expect(new RepetitionDetector().detect("")).toEqual([]);
  });
});
