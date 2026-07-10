import { describe, it, expect, vi, beforeEach } from "vitest";
import { OllamaAdapter } from "./ollama-adapter";

describe("OllamaAdapter", () => {
  const adapter = new OllamaAdapter({ model: "llama3" });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends a generate request to the Ollama endpoint", async () => {
    const mockResponse = {
      response: "Olá mundo",
      prompt_eval_count: 5,
      eval_count: 3,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const response = await adapter.complete("Oi", {
      temperature: 0.7,
      maxTokens: 100,
      stopSequences: ["\n"],
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:11434/api/generate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3",
          prompt: "Oi",
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 100,
            stop: ["\n"],
          },
        }),
      },
    );

    expect(response.text).toBe("Olá mundo");
    expect(response.usage).toEqual({
      promptTokens: 5,
      completionTokens: 3,
      totalTokens: 8,
    });
  });

  it("uses a custom baseUrl when provided", async () => {
    const remote = new OllamaAdapter({ model: "llama3", baseUrl: "http://192.168.0.10:11434" });
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ response: "x" }),
    });

    await remote.complete("Oi");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://192.168.0.10:11434/api/generate",
      expect.anything(),
    );
  });

  it("throws an error when the API request fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(adapter.complete("Oi")).rejects.toThrow("Ollama API error: 500");
  });
});
