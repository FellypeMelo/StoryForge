import { describe, it, expect, vi, beforeEach } from "vitest";
import { LlamaCppAdapter } from "./llama-cpp-adapter";

describe("LlamaCppAdapter", () => {
  const baseUrl = "http://localhost:8080";
  const adapter = new LlamaCppAdapter(baseUrl);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send a completion request to llama.cpp", async () => {
    const mockResponse = {
      content: "Generated text",
      tokens_predicted: 10,
      tokens_evaluated: 5,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const response = await adapter.complete("Test prompt", {
      temperature: 0.7,
      maxTokens: 100,
      stopSequences: ["\n"],
    });

    expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/completion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Test prompt",
        temperature: 0.7,
        n_predict: 100,
        stop: ["\n"],
      }),
    });

    expect(response.text).toBe("Generated text");
    expect(response.usage).toEqual({
      promptTokens: 5,
      completionTokens: 10,
      totalTokens: 15,
    });
  });

  it("should throw an error if the API request fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(adapter.complete("Test prompt")).rejects.toThrow("Llama.cpp API error: 500");
  });
});
