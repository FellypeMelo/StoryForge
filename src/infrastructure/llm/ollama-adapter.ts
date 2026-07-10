import { LlmPort, LlmOptions, LlmResponse } from "../../domain/ideation/ports/llm-port";

export interface OllamaAdapterConfig {
  model: string;
  baseUrl?: string;
}

/**
 * OllamaAdapter targets a local Ollama server (POST /api/generate).
 */
export class OllamaAdapter implements LlmPort {
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(config: OllamaAdapterConfig) {
    this.model = config.model;
    this.baseUrl = config.baseUrl ?? "http://localhost:11434";
  }

  async complete(prompt: string, options?: LlmOptions): Promise<LlmResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        options: {
          temperature: options?.temperature,
          num_predict: options?.maxTokens,
          stop: options?.stopSequences,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    const promptTokens = data.prompt_eval_count ?? 0;
    const completionTokens = data.eval_count ?? 0;

    return {
      text: data.response ?? "",
      usage:
        data.prompt_eval_count !== undefined || data.eval_count !== undefined
          ? {
              promptTokens,
              completionTokens,
              totalTokens: promptTokens + completionTokens,
            }
          : undefined,
    };
  }
}
