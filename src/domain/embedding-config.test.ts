import { describe, it, expect } from "vitest";
import { EmbeddingConfig } from "./embedding-config";

describe("EmbeddingConfig", () => {
  it("creates a valid config when enabled with a non-empty baseUrl", () => {
    const config = EmbeddingConfig.create({
      enabled: true,
      baseUrl: "http://127.0.0.1:8080",
      model: "nomic-embed-text",
    });

    expect(config.enabled).toBe(true);
    expect(config.baseUrl).toBe("http://127.0.0.1:8080");
    expect(config.model).toBe("nomic-embed-text");
  });

  it("creates a valid config when disabled even without a baseUrl", () => {
    const config = EmbeddingConfig.create({ enabled: false, baseUrl: "", model: "" });

    expect(config.enabled).toBe(false);
    expect(config.baseUrl).toBe("");
  });

  it("throws when enabled but baseUrl is empty", () => {
    expect(() => EmbeddingConfig.create({ enabled: true, baseUrl: "", model: "" })).toThrow();
  });

  it("throws when enabled but baseUrl is whitespace only", () => {
    expect(() => EmbeddingConfig.create({ enabled: true, baseUrl: "   ", model: "" })).toThrow();
  });
});
