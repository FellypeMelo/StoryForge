import { describe, it, expect } from "vitest";
import { analyzeProse } from "./analyze-prose";

describe("analyzeProse", () => {
  it("retorna lista vazia para texto limpo", () => {
    expect(analyzeProse("A lâmina bateu na pedra.")).toEqual([]);
  });

  it("retorna lista vazia para texto vazio", () => {
    expect(analyzeProse("")).toEqual([]);
  });

  it("detecta AI-ism com posição, categoria e tipo", () => {
    const term = "silêncio ensurdecedor";
    const result = analyzeProse(`Um ${term} tomou a sala.`);

    const aiism = result.find((h) => h.type === "aiism");
    expect(aiism).toBeDefined();
    expect(aiism!.text).toBe(term);
    expect(aiism!.start).toBe(3);
    expect(aiism!.end).toBe(3 + term.length);
    expect(aiism!.category).toBe("generic-phrase");
  });

  it("detecta violação MRU (tell) com sugestão no tooltip", () => {
    const result = analyzeProse("Ela sentiu medo ao abrir a porta.");

    const mru = result.find((h) => h.type === "mru");
    expect(mru).toBeDefined();
    expect(mru!.text.toLowerCase()).toContain("sentiu medo");
    expect(mru!.tooltip.length).toBeGreaterThan(0);
  });

  it("localiza termos sem diferenciar maiúsculas de minúsculas", () => {
    const result = analyzeProse("Silêncio ensurdecedor pairava ali.");
    expect(result.some((h) => h.type === "aiism" && h.start === 0)).toBe(true);
  });

  it("combina achados de AI-ism e MRU no mesmo texto", () => {
    const result = analyzeProse(
      "Ela sentiu medo quando o silêncio ensurdecedor voltou.",
    );
    expect(result.some((h) => h.type === "aiism")).toBe(true);
    expect(result.some((h) => h.type === "mru")).toBe(true);
  });
});
