import { LlmPort, LlmOptions, LlmResponse } from "../../domain/ideation/ports/llm-port";

export interface OpenAiAdapterConfig {
  apiKey: string;
  model: string;
  /** Override for OpenAI-compatible servers (e.g. llama.cpp at http://localhost:8080/v1). */
  baseUrl?: string;
}

/**
 * OpenAiAdapter targets the OpenAI Chat Completions API (POST /chat/completions).
 * The configurable baseUrl also covers any OpenAI-compatible server.
 */
export class OpenAiAdapter implements LlmPort {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(config: OpenAiAdapterConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.baseUrl = config.baseUrl ?? "https://api.openai.com/v1";
  }

  async complete(prompt: string, options?: LlmOptions): Promise<LlmResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        stop: options?.stopSequences,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const usage = data.usage;

    return {
      text: data.choices?.[0]?.message?.content ?? "",
      usage: usage
        ? {
            promptTokens: usage.prompt_tokens ?? 0,
            completionTokens: usage.completion_tokens ?? 0,
            totalTokens: usage.total_tokens ?? 0,
          }
        : undefined,
    };
  }
}
