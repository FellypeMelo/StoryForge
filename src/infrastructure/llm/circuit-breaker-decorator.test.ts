import { describe, it, expect, vi, beforeEach } from "vitest";
import { CircuitBreakerDecorator } from "./circuit-breaker-decorator";
import { LlmPort } from "../../domain/ideation/ports/llm-port";

describe("CircuitBreakerDecorator", () => {
  let mockProvider: LlmPort;

  beforeEach(() => {
    mockProvider = {
      complete: vi.fn(),
    };
  });

  it("should pass through requests when the circuit is closed", async () => {
    (mockProvider.complete as any).mockResolvedValue({ text: "Success" });
    const decorator = new CircuitBreakerDecorator(mockProvider, { failureThreshold: 2 });

    const response = await decorator.complete("Hello");

    expect(response.text).toBe("Success");
    expect(mockProvider.complete).toHaveBeenCalledTimes(1);
  });

  it("should open the circuit after failures exceed threshold", async () => {
    (mockProvider.complete as any).mockRejectedValue(new Error("Network Error"));
    const decorator = new CircuitBreakerDecorator(mockProvider, { 
      failureThreshold: 2,
      resetTimeout: 1000 
    });

    // First failure
    await expect(decorator.complete("Hello")).rejects.toThrow("Network Error");
    // Second failure - should open the circuit
    await expect(decorator.complete("Hello")).rejects.toThrow("Network Error");

    // Third call - should fail immediately without calling the provider
    await expect(decorator.complete("Hello")).rejects.toThrow("Circuit breaker is OPEN");
    expect(mockProvider.complete).toHaveBeenCalledTimes(2);
  });

  it("should reset after the timeout", async () => {
    vi.useFakeTimers();
    (mockProvider.complete as any).mockRejectedValue(new Error("Fail"));
    const decorator = new CircuitBreakerDecorator(mockProvider, { 
      failureThreshold: 1,
      resetTimeout: 1000 
    });

    await expect(decorator.complete("Hello")).rejects.toThrow("Fail");
    await expect(decorator.complete("Hello")).rejects.toThrow("Circuit breaker is OPEN");

    // Advance time
    vi.advanceTimersByTime(1100);

    (mockProvider.complete as any).mockResolvedValue({ text: "Recovered" });
    const response = await decorator.complete("Hello");

    expect(response.text).toBe("Recovered");
    expect(mockProvider.complete).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
