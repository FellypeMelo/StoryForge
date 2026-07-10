import { LlmPort, LlmOptions, LlmResponse } from "../../domain/ideation/ports/llm-port";

export interface GeminiAdapterConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

interface GeminiPart {
  text?: string;
}

/**
 * GeminiAdapter targets the Google Generative Language API
 * (POST /models/{model}:generateContent).
 */
export class GeminiAdapter implements LlmPort {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(config: GeminiAdapterConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.baseUrl = config.baseUrl ?? "https://generativelanguage.googleapis.com/v1beta";
  }

  async complete(prompt: string, options?: LlmOptions): Promise<LlmResponse> {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options?.temperature,
          maxOutputTokens: options?.maxTokens,
          stopSequences: options?.stopSequences,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const parts: GeminiPart[] = data.candidates?.[0]?.content?.parts ?? [];
    const text = parts.map((p) => p.text ?? "").join("");

    const usage = data.usageMetadata;
    return {
      text,
      usage: usage
        ? {
            promptTokens: usage.promptTokenCount ?? 0,
            completionTokens: usage.candidatesTokenCount ?? 0,
            totalTokens: usage.totalTokenCount ?? 0,
          }
        : undefined,
    };
  }
}
