import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnthropicAdapter } from "./anthropic-adapter";

describe("AnthropicAdapter", () => {
  const adapter = new AnthropicAdapter({ apiKey: "sk-ant", model: "claude-opus-4-8" });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends a messages request to the Anthropic endpoint", async () => {
    const mockResponse = {
      content: [{ type: "text", text: "Olá mundo" }],
      usage: { input_tokens: 5, output_tokens: 3 },
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
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": "sk-ant",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-opus-4-8",
          max_tokens: 100,
          messages: [{ role: "user", content: "Oi" }],
          temperature: 0.7,
          stop_sequences: ["\n"],
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

  it("concatenates multiple text blocks", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [
            { type: "text", text: "parte 1 " },
            { type: "text", text: "parte 2" },
          ],
        }),
    });

    const response = await adapter.complete("Oi");
    expect(response.text).toBe("parte 1 parte 2");
  });

  it("defaults max_tokens to 4096 when not provided", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ type: "text", text: "x" }] }),
    });

    await adapter.complete("Oi");

    const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body.max_tokens).toBe(4096);
  });

  it("throws an error when the API request fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 429 });
    await expect(adapter.complete("Oi")).rejects.toThrow("Anthropic API error: 429");
  });
});
