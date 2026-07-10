import { LlmPort } from "../../domain/ideation/ports/llm-port";
import { ProviderConfig } from "../../domain/ports/provider-config-repository";
import { DummyLlmPort } from "./dummy-llm-port";
import { LlamaCppAdapter } from "./llama-cpp-adapter";
import { OpenAiAdapter } from "./openai-adapter";
import { AnthropicAdapter } from "./anthropic-adapter";
import { GeminiAdapter } from "./gemini-adapter";
import { OllamaAdapter } from "./ollama-adapter";
import { CircuitBreakerDecorator } from "./circuit-breaker-decorator";
import { LlmRouter } from "./llm-router";

/** Builds the raw adapter for a provider (no circuit breaker). */
function buildAdapter(config: ProviderConfig): LlmPort {
  switch (config.providerId) {
    case "llamacpp":
      return new LlamaCppAdapter(config.baseUrl);
    case "openai":
      return new OpenAiAdapter({
        apiKey: config.apiKey ?? "",
        model: config.defaultModel,
        baseUrl: config.baseUrl,
      });
    case "anthropic":
      return new AnthropicAdapter({
        apiKey: config.apiKey ?? "",
        model: config.defaultModel,
        baseUrl: config.baseUrl,
      });
    case "gemini":
      return new GeminiAdapter({
        apiKey: config.apiKey ?? "",
        model: config.defaultModel,
        baseUrl: config.baseUrl,
      });
    case "ollama":
      return new OllamaAdapter({
        model: config.defaultModel,
        baseUrl: config.baseUrl,
      });
    default:
      return new DummyLlmPort();
  }
}

/**
 * Resolves a single active provider into a circuit-breaker-protected LlmPort.
 * Falls back to DummyLlmPort so the app stays usable offline/unconfigured.
 */
export function createLlmPort(config: ProviderConfig | null): LlmPort {
  if (!config || !config.isActive) return new DummyLlmPort();
  return new CircuitBreakerDecorator(buildAdapter(config));
}

/**
 * Builds a routed LlmPort from all persisted configs: the active providers form
 * an ordered fallback chain, each protected by its own circuit breaker.
 * Falls back to DummyLlmPort when nothing is active.
 */
export function createRoutedLlmPort(configs: ProviderConfig[]): LlmPort {
  const active = configs.filter((c) => c.isActive);
  if (active.length === 0) return new DummyLlmPort();

  const ports = active.map((c) => new CircuitBreakerDecorator(buildAdapter(c)));
  return new LlmRouter(ports);
}
