import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenAiAdapter } from "./openai-adapter";

describe("OpenAiAdapter", () => {
  const adapter = new OpenAiAdapter({ apiKey: "sk-test", model: "gpt-4o-mini" });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends a chat completion request to the OpenAI endpoint", async () => {
    const mockResponse = {
      choices: [{ message: { content: "Olá mundo" } }],
      usage: { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 },
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
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer sk-test",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "Oi" }],
          temperature: 0.7,
          max_tokens: 100,
          stop: ["\n"],
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

  it("throws an error when the API request fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 });
    await expect(adapter.complete("Oi")).rejects.toThrow("OpenAI API error: 401");
  });

  it("supports a custom baseUrl for OpenAI-compatible servers", async () => {
    const local = new OpenAiAdapter({
      apiKey: "none",
      model: "local",
      baseUrl: "http://localhost:8080/v1",
    });
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: "x" } }] }),
    });

    await local.complete("Oi");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/v1/chat/completions",
      expect.anything(),
    );
  });
});
