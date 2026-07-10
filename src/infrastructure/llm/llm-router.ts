import { LlmPort, LlmOptions, LlmResponse } from "../../domain/ideation/ports/llm-port";

/**
 * LlmRouter tries an ordered list of providers, returning the first success.
 * Each provider should already be wrapped in a CircuitBreakerDecorator so that
 * a persistently failing provider is skipped quickly on subsequent calls.
 */
export class LlmRouter implements LlmPort {
  constructor(private readonly providers: LlmPort[]) {
    if (providers.length === 0) {
      throw new Error("LlmRouter requires at least one provider");
    }
  }

  async complete(prompt: string, options?: LlmOptions): Promise<LlmResponse> {
    const errors: string[] = [];

    for (const provider of this.providers) {
      try {
        return await provider.complete(prompt, options);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err));
      }
    }

    throw new Error(`All LLM providers failed: ${errors.join("; ")}`);
  }
}
