import { describe, it, expect } from "vitest";
import { AiismBlacklist } from "./aiism-blacklist";

describe("AiismBlacklist", () => {
  it("comes pre-loaded with terms", () => {
    const blacklist = AiismBlacklist.default();
    expect(blacklist.terms.size).toBeGreaterThan(0);
  });

  it("contains metaphor category terms", () => {
    const blacklist = AiismBlacklist.default();
    const metaphors = blacklist.getByCategory("metaphor");
    expect(metaphors.length).toBeGreaterThan(0);
  });

  it("contains body reaction terms", () => {
    const blacklist = AiismBlacklist.default();
    const reactions = blacklist.getByCategory("body-reaction");
    expect(reactions.length).toBeGreaterThan(0);
    expect(reactions.some((t) => t.term.includes("mandíbula"))).toBe(true);
  });

  it("contains connector terms", () => {
    const blacklist = AiismBlacklist.default();
    const connectors = blacklist.getByCategory("connector");
    expect(connectors.length).toBeGreaterThan(0);
  });

  it("allows adding custom terms", () => {
    const blacklist = AiismBlacklist.default();
    const expanded = blacklist.add({
      term: "algo clichê",
      category: "metaphor",
      reason: "Personal preference",
    });
    expect(expanded.terms.size).toBeGreaterThan(blacklist.terms.size);
  });
});
