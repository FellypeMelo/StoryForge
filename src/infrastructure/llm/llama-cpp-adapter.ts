import { LlmPort, LlmOptions, LlmResponse } from "../../domain/ideation/ports/llm-port";

/**
 * LlamaCppAdapter provides a direct connection to a llama.cpp server instance.
 * It uses the native /completion endpoint.
 */
export class LlamaCppAdapter implements LlmPort {
  constructor(
    private readonly baseUrl: string = "http://localhost:8080"
  ) {}

  async complete(prompt: string, options?: LlmOptions): Promise<LlmResponse> {
    const response = await fetch(`${this.baseUrl}/completion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        temperature: options?.temperature,
        n_predict: options?.maxTokens,
        stop: options?.stopSequences,
      }),
    });

    if (!response.ok) {
      throw new Error(`Llama.cpp API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      text: data.content,
      usage: {
        promptTokens: data.tokens_evaluated || 0,
        completionTokens: data.tokens_predicted || 0,
        totalTokens: (data.tokens_evaluated || 0) + (data.tokens_predicted || 0),
      },
    };
  }
}
