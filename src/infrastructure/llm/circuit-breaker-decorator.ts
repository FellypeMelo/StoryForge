import { LlmPort, LlmOptions, LlmResponse } from "../../domain/ideation/ports/llm-port";

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number; // in milliseconds
}

enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

/**
 * CircuitBreakerDecorator implements the Circuit Breaker pattern for LLM providers.
 * It prevents calling a failing provider for a specified timeout period.
 */
export class CircuitBreakerDecorator implements LlmPort {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private lastFailureTime?: number;

  constructor(
    private readonly provider: LlmPort,
    private readonly options: CircuitBreakerOptions = { failureThreshold: 3, resetTimeout: 30000 }
  ) {}

  async complete(prompt: string, options?: LlmOptions): Promise<LlmResponse> {
    this.updateState();

    if (this.state === CircuitState.OPEN) {
      throw new Error(`Circuit breaker is OPEN for this provider. Last failure at ${new Date(this.lastFailureTime!).toISOString()}`);
    }

    try {
      const response = await this.provider.complete(prompt, options);
      this.onSuccess();
      return response;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private updateState(): void {
    if (this.state === CircuitState.OPEN && this.lastFailureTime) {
      const now = Date.now();
      if (now - this.lastFailureTime > this.options.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
      }
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  getState(): string {
    return CircuitState[this.state];
  }
}
