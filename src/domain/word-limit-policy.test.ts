import { describe, it, expect } from "vitest";
import { WordLimitPolicy } from "./word-limit-policy";

describe("WordLimitPolicy", () => {
  it("accepts word limit at minimum boundary (500)", () => {
    const result = WordLimitPolicy.validate(500);
    expect(result.valid).toBe(true);
  });

  it("accepts word limit at maximum boundary (800)", () => {
    const result = WordLimitPolicy.validate(800);
    expect(result.valid).toBe(true);
  });

  it("accepts word limit within range", () => {
    const result = WordLimitPolicy.validate(650);
    expect(result.valid).toBe(true);
  });

  it("rejects word limit below minimum", () => {
    const result = WordLimitPolicy.validate(499);
    expect(result.valid).toBe(false);
    expect(result.message).toContain("500");
  });

  it("rejects word limit above maximum (CAD rule)", () => {
    const result = WordLimitPolicy.validate(801);
    expect(result.valid).toBe(false);
    expect(result.message).toContain("800");
  });
});
