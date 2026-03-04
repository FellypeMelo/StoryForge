import { describe, it, expect } from "vitest";
import { ClicheBlacklist } from "./cliche-blacklist";
import { Genre } from "../value-objects/genre";

describe("ClicheBlacklist Entity", () => {
  it("should create a valid blacklist", () => {
    const genre = Genre.create("Fantasy");
    const blacklist = new ClicheBlacklist(genre, ["Chosen One", "Dark Lord"]);
    expect(blacklist.genre.value).toBe("Fantasy");
    expect(blacklist.bannedTerms).toContain("Chosen One");
  });

  it("should throw error if bannedTerms is null or undefined", () => {
    const genre = Genre.create("Fantasy");
    expect(() => new ClicheBlacklist(genre, null as any)).toThrow(
      "Banned terms list cannot be empty",
    );
    expect(() => new ClicheBlacklist(genre, undefined as any)).toThrow(
      "Banned terms list cannot be empty",
    );
  });

  it("should throw error if bannedTerms is empty", () => {
    const genre = Genre.create("Sci-Fi");
    expect(() => {
      new ClicheBlacklist(genre, []);
    }).toThrow("Banned terms list cannot be empty");
  });
});
