import { LlmPort } from "../../domain/ideation/ports/llm-port";
import { ProviderConfig } from "../../domain/ports/provider-config-repository";
import { DummyLlmPort } from "./dummy-llm-port";
import { LlamaCppAdapter } from "./llama-cpp-adapter";
import { CircuitBreakerDecorator } from "./circuit-breaker-decorator";

/**
 * Resolves the active LlmPort from persisted provider config.
 * Falls back to DummyLlmPort so the app stays usable offline/unconfigured.
 */
export function createLlmPort(config: ProviderConfig | null): LlmPort {
  if (!config || !config.isActive) return new DummyLlmPort();

  if (config.providerId === "llamacpp") {
    return new CircuitBreakerDecorator(new LlamaCppAdapter(config.baseUrl));
  }

  return new DummyLlmPort();
}
