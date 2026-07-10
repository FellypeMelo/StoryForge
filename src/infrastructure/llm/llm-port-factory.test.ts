import { describe, it, expect } from "vitest";
import { createLlmPort } from "./llm-port-factory";
import { DummyLlmPort } from "./dummy-llm-port";
import { CircuitBreakerDecorator } from "./circuit-breaker-decorator";
import { ProviderConfig } from "../../domain/ports/provider-config-repository";

describe("createLlmPort", () => {
  it("sem config retorna DummyLlmPort", () => {
    const port = createLlmPort(null);
    expect(port).toBeInstanceOf(DummyLlmPort);
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

  it("llamacpp ativo retorna adapter protegido por circuit breaker", () => {
    const config: ProviderConfig = {
      providerId: "llamacpp",
      baseUrl: "http://localhost:8080",
      defaultModel: "local",
      isActive: true,
    };
    expect(createLlmPort(config)).toBeInstanceOf(CircuitBreakerDecorator);
  });

  it("provider ainda não suportado cai em DummyLlmPort", () => {
    const config: ProviderConfig = {
      providerId: "openai",
      apiKey: "sk-test",
      defaultModel: "gpt-4o",
      isActive: true,
    };
    expect(createLlmPort(config)).toBeInstanceOf(DummyLlmPort);
  });
});
