import { describe, it, expect, vi } from "vitest";
import { LlmRouter } from "./llm-router";
import { LlmPort } from "../../domain/ideation/ports/llm-port";

function stub(impl: LlmPort["complete"]): LlmPort {
  return { complete: vi.fn(impl) };
}

describe("LlmRouter", () => {
  it("returns the first provider's response and does not call fallbacks", async () => {
    const primary = stub(() => Promise.resolve({ text: "primário" }));
    const fallback = stub(() => Promise.resolve({ text: "reserva" }));
    const router = new LlmRouter([primary, fallback]);

    const res = await router.complete("x");

    expect(res.text).toBe("primário");
    expect(fallback.complete).not.toHaveBeenCalled();
  });

  it("falls back to the next provider when the primary fails", async () => {
    const primary = stub(() => Promise.reject(new Error("indisponível")));
    const fallback = stub(() => Promise.resolve({ text: "reserva" }));
    const router = new LlmRouter([primary, fallback]);

    const res = await router.complete("x");

    expect(res.text).toBe("reserva");
    expect(primary.complete).toHaveBeenCalledOnce();
  });

  it("throws an aggregated error when every provider fails", async () => {
    const a = stub(() => Promise.reject(new Error("e1")));
    const b = stub(() => Promise.reject(new Error("e2")));
    const router = new LlmRouter([a, b]);

    await expect(router.complete("x")).rejects.toThrow(/All LLM providers failed/);
  });

  it("requires at least one provider", () => {
    expect(() => new LlmRouter([])).toThrow();
  });

  it("forwards options to the selected provider", async () => {
    const primary = stub(() => Promise.resolve({ text: "ok" }));
    const router = new LlmRouter([primary]);

    await router.complete("x", { temperature: 0.2, maxTokens: 50 });

    expect(primary.complete).toHaveBeenCalledWith("x", { temperature: 0.2, maxTokens: 50 });
  });
});
