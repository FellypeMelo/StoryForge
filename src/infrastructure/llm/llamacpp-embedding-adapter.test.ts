import { describe, it, expect, vi, beforeEach } from "vitest";
import { LlamaCppEmbeddingAdapter } from "./llamacpp-embedding-adapter";

describe("LlamaCppEmbeddingAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends an OpenAI-compatible embeddings request", async () => {
    const adapter = new LlamaCppEmbeddingAdapter({
      baseUrl: "http://127.0.0.1:8080",
      model: "nomic-embed-text",
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [{ embedding: [0.1, 0.2, 0.3] }] }),
    });

    const result = await adapter.embed("hello world");

    expect(globalThis.fetch).toHaveBeenCalledWith("http://127.0.0.1:8080/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "nomic-embed-text", input: "hello world" }),
    });
    expect(result).toEqual([0.1, 0.2, 0.3]);
  });

  it("strips a trailing slash from baseUrl", async () => {
    const adapter = new LlamaCppEmbeddingAdapter({ baseUrl: "http://localhost:8080/" });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [{ embedding: [1] }] }),
    });

    await adapter.embed("x");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/v1/embeddings",
      expect.anything(),
    );
  });

  it("defaults model to an empty string when omitted", async () => {
    const adapter = new LlamaCppEmbeddingAdapter({ baseUrl: "http://127.0.0.1:8080" });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [{ embedding: [1, 2] }] }),
    });

    await adapter.embed("hi");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ model: "", input: "hi" }),
      }),
    );
  });

  it("parses the llama.cpp native {embedding:[...]} shape", async () => {
    const adapter = new LlamaCppEmbeddingAdapter({ baseUrl: "http://127.0.0.1:8080" });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ embedding: [0.5, 0.6] }),
    });

    const result = await adapter.embed("hello");

    expect(result).toEqual([0.5, 0.6]);
  });

  it("parses a bare array-of-objects shape", async () => {
    const adapter = new LlamaCppEmbeddingAdapter({ baseUrl: "http://127.0.0.1:8080" });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([{ embedding: [0.7, 0.8] }]),
    });

    const result = await adapter.embed("hello");

    expect(result).toEqual([0.7, 0.8]);
  });

  it("throws when the API responds with a non-ok status", async () => {
    const adapter = new LlamaCppEmbeddingAdapter({ baseUrl: "http://127.0.0.1:8080" });

    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });

    await expect(adapter.embed("hello")).rejects.toThrow("Embedding API error: 500");
  });

  it("throws when the response shape has no usable embedding", async () => {
    const adapter = new LlamaCppEmbeddingAdapter({ baseUrl: "http://127.0.0.1:8080" });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [] }),
    });

    await expect(adapter.embed("hello")).rejects.toThrow("Embedding response inválida");
  });

  it("throws when the embedding array is empty", async () => {
    const adapter = new LlamaCppEmbeddingAdapter({ baseUrl: "http://127.0.0.1:8080" });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ embedding: [] }),
    });

    await expect(adapter.embed("hello")).rejects.toThrow("Embedding response inválida");
  });
});
