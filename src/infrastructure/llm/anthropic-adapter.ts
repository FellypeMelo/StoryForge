import { LlmPort, LlmOptions, LlmResponse } from "../../domain/ideation/ports/llm-port";

export interface AnthropicAdapterConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

/**
 * AnthropicAdapter targets the Anthropic Messages API (POST /messages).
 * Runs in a Tauri webview, so it opts into direct browser access.
 */
export class AnthropicAdapter implements LlmPort {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(config: AnthropicAdapterConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.baseUrl = config.baseUrl ?? "https://api.anthropic.com/v1";
  }

  async complete(prompt: string, options?: LlmOptions): Promise<LlmResponse> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options?.maxTokens ?? 4096,
        messages: [{ role: "user", content: prompt }],
        temperature: options?.temperature,
        stop_sequences: options?.stopSequences,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const blocks: AnthropicContentBlock[] = data.content ?? [];
    const text = blocks
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("");

    const usage = data.usage;
    const promptTokens = usage?.input_tokens ?? 0;
    const completionTokens = usage?.output_tokens ?? 0;

    return {
      text,
      usage: usage
        ? {
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
          }
        : undefined,
    };
  }
}
