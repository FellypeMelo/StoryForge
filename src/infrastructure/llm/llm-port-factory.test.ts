import { describe, it, expect } from "vitest";
import { createLlmPort, createRoutedLlmPort } from "./llm-port-factory";
import { DummyLlmPort } from "./dummy-llm-port";
import { CircuitBreakerDecorator } from "./circuit-breaker-decorator";
import { LlmRouter } from "./llm-router";
import { ProviderConfig } from "../../domain/ports/provider-config-repository";

describe("createLlmPort", () => {
  it("sem config retorna DummyLlmPort", () => {
    expect(createLlmPort(null)).toBeInstanceOf(DummyLlmPort);
  });

  it("config inativa retorna DummyLlmPort", () => {
    const config: ProviderConfig = {
      providerId: "llamacpp",
      baseUrl: "http://localhost:8080",
      defaultModel: "local",
      isActive: false,
    };
    expect(createLlmPort(config)).toBeInstanceOf(DummyLlmPort);
  });

  it.each(["llamacpp", "openai", "anthropic", "gemini", "ollama"] as const)(
    "%s ativo retorna adapter protegido por circuit breaker",
    (providerId) => {
      const config: ProviderConfig = {
        providerId,
        apiKey: "sk-test",
        baseUrl: "http://localhost:8080",
        defaultModel: "modelo",
        isActive: true,
      };
      expect(createLlmPort(config)).toBeInstanceOf(CircuitBreakerDecorator);
    },
  );
});

describe("createRoutedLlmPort", () => {
  it("sem provedores ativos retorna DummyLlmPort", () => {
    const configs: ProviderConfig[] = [
      { providerId: "openai", apiKey: "k", defaultModel: "gpt", isActive: false },
    ];
    expect(createRoutedLlmPort(configs)).toBeInstanceOf(DummyLlmPort);
  });

  it("um provedor ativo retorna um LlmRouter", () => {
    const configs: ProviderConfig[] = [
      { providerId: "llamacpp", baseUrl: "http://localhost:8080", defaultModel: "local", isActive: true },
    ];
    expect(createRoutedLlmPort(configs)).toBeInstanceOf(LlmRouter);
  });

  it("múltiplos provedores ativos retornam um LlmRouter com cadeia de fallback", () => {
    const configs: ProviderConfig[] = [
      { providerId: "llamacpp", baseUrl: "http://localhost:8080", defaultModel: "local", isActive: true },
      { providerId: "openai", apiKey: "k", defaultModel: "gpt-4o", isActive: true },
    ];
    expect(createRoutedLlmPort(configs)).toBeInstanceOf(LlmRouter);
  });
});
