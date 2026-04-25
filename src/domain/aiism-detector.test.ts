import { describe, it, expect } from "vitest";
import { AiismDetector } from "./aiism-detector";
import { AiismBlacklist } from "./aiism-blacklist";

describe("AiismDetector", () => {
  it("detects metaphor AI-ism in text", () => {
    const blacklist = AiismBlacklist.default();
    const text = "Uma rica tapeçaria de sentimentos envolveu a cidade.";
    const result = AiismDetector.scan(text, blacklist);
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.findings.some((f) => f.category === "metaphor")).toBe(true);
  });

  it("detects body reaction AI-ism", () => {
    const blacklist = AiismBlacklist.default();
    const text = "Ele apertou a mandíbula com força quando leu a carta.";
    const result = AiismDetector.scan(text, blacklist);
    expect(result.findings.some((f) => f.category === "body-reaction")).toBe(true);
  });

  it("detects connector AI-ism", () => {
    const blacklist = AiismBlacklist.default();
    const text = "Ele não apenas correu, mas também voou.";
    const result = AiismDetector.scan(text, blacklist);
    expect(result.findings.some((f) => f.category === "connector")).toBe(true);
  });

  it("detects clean resolution", () => {
    const blacklist = AiismBlacklist.default();
    const text = "Ela aprendeu uma lição importante naquele dia.";
    const result = AiismDetector.scan(text, blacklist);
    expect(result.findings.some((f) => f.category === "clean-resolution")).toBe(true);
  });

  it("returns empty findings for clean text", () => {
    const blacklist = AiismBlacklist.default();
    const text = "She walked through the garden. The roses were red.";
    const result = AiismDetector.scan(text, blacklist);
    expect(result.findings.length).toBe(0);
  });

  it("detects -mente adverbs above threshold", () => {
    const blacklist = AiismBlacklist.default();
    const text = "Ele caminhou lentamente, olhou tristemente, falou calmamente e sorriu docemente para todos.";
    const result = AiismDetector.scan(text, blacklist);
    expect(result.menteAdverbCount).toBeGreaterThan(3);
    expect(result.hasExcessiveMenteAdverbs).toBe(true);
  });

  it("does not flag -mente adverbs below threshold", () => {
    const blacklist = AiismBlacklist.default();
    const text = "Ele caminhou lentamente até a porta.";
    const result = AiismDetector.scan(text, blacklist);
    expect(result.hasExcessiveMenteAdverbs).toBe(false);
  });
});
