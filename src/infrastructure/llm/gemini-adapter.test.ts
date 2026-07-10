import { describe, it, expect, vi, beforeEach } from "vitest";
import { GeminiAdapter } from "./gemini-adapter";

describe("GeminiAdapter", () => {
  const adapter = new GeminiAdapter({ apiKey: "gk-test", model: "gemini-2.0-flash" });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends a generateContent request to the Gemini endpoint", async () => {
    const mockResponse = {
      candidates: [{ content: { parts: [{ text: "Olá mundo" }] } }],
      usageMetadata: {
        promptTokenCount: 5,
        candidatesTokenCount: 3,
        totalTokenCount: 8,
      },
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
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=gk-test",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Oi" }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
            stopSequences: ["\n"],
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

  it("throws an error when the API request fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    await expect(adapter.complete("Oi")).rejects.toThrow("Gemini API error: 403");
  });
});
