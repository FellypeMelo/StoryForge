import { describe, it, expect } from "vitest";
import { BlacklistWordDetector } from "./blacklist-word-detector";

describe("BlacklistWordDetector", () => {
  it("has a stable id", () => {
    expect(new BlacklistWordDetector().id).toBe("blacklist-word");
  });

  it("returns laranja alerts for blacklisted AI-isms", () => {
    const alerts = new BlacklistWordDetector().detect(
      "Uma rica tapeçaria de sentimentos envolveu a cidade.",
    );
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].level).toBe("laranja");
    expect(alerts[0].excerpt).toBe("rica tapeçaria");
  });

  it("returns no alerts for clean text", () => {
    expect(new BlacklistWordDetector().detect("Texto limpo sem clichês.")).toEqual([]);
  });

  it("returns no alerts for empty text", () => {
    expect(new BlacklistWordDetector().detect("")).toEqual([]);
  });
});
