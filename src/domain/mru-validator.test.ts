import { describe, it, expect } from "vitest";
import { MruValidator } from "./mru-validator";

describe("MruValidator", () => {
  it("detects direct emotion naming (Tell)", () => {
    const result = MruValidator.scan("Ela sentiu raiva quando viu a carta.");
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations.some((v) => v.type === "tell")).toBe(true);
  });

  it("detects 'ficou' + emotion pattern", () => {
    const result = MruValidator.scan("Ele ficou triste com a notícia.");
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it("detects 'estava' + emotion pattern", () => {
    const result = MruValidator.scan("Ela estava com medo do escuro.");
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it("detects 'sentiu' + emotion pattern", () => {
    const result = MruValidator.scan("Ele sentiu tristeza profunda.");
    expect(result.violations.some((v) => v.type === "tell")).toBe(true);
  });

  it("detects English tell patterns", () => {
    const result = MruValidator.scan("She felt angry and was afraid of the dark.");
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it("returns no violations for Show-compliant text", () => {
    const result = MruValidator.scan("Her hands trembled. She backed against the wall, breathing fast.");
    expect(result.violations.length).toBe(0);
  });

  it("provides MRU suggestion for Tell violation", () => {
    const result = MruValidator.scan("Ela sentiu raiva.");
    expect(result.violations[0].suggestion).toBeDefined();
    expect(result.violations[0].suggestion.length).toBeGreaterThan(0);
  });
});
