import { describe, it, expect, vi } from "vitest";
import { RefineProseUseCase } from "./refine-prose";
import type { LlmPort, LlmResponse } from "../../domain/ideation/ports/llm-port";

function makeLlm(text = "Texto revisado."): LlmPort & { prompts: string[] } {
  const prompts: string[] = [];
  return {
    prompts,
    async complete(prompt: string): Promise<LlmResponse> {
      prompts.push(prompt);
      return { text };
    },
  };
}

describe("RefineProseUseCase", () => {
  it("envia instrução de reescrita junto com o trecho", async () => {
    const llm = makeLlm();
    await new RefineProseUseCase(llm).execute("rewrite", "Ela sentiu medo.");

    expect(llm.prompts[0]).toContain("Reescreva");
    expect(llm.prompts[0]).toContain("Ela sentiu medo.");
  });

  it("envia instrução de expansão junto com o trecho", async () => {
    const llm = makeLlm();
    await new RefineProseUseCase(llm).execute("expand", "A porta rangeu.");

    expect(llm.prompts[0]).toContain("Expanda");
    expect(llm.prompts[0]).toContain("A porta rangeu.");
  });

  it("envia instrução de refino junto com o trecho", async () => {
    const llm = makeLlm();
    await new RefineProseUseCase(llm).execute("refine", "O vento uivava.");

    expect(llm.prompts[0]).toContain("Refine");
    expect(llm.prompts[0]).toContain("O vento uivava.");
  });

  it("retorna o texto do LLM sem espaços nas bordas", async () => {
    const llm = makeLlm("  Prosa nova.  ");
    const result = await new RefineProseUseCase(llm).execute("refine", "abc");
    expect(result).toBe("Prosa nova.");
  });

  it("rejeita texto vazio sem chamar o LLM", async () => {
    const llm = makeLlm();
    await expect(
      new RefineProseUseCase(llm).execute("rewrite", "   "),
    ).rejects.toThrow();
    expect(llm.prompts).toHaveLength(0);
  });

  it("propaga falha do LLM", async () => {
    const llm: LlmPort = {
      complete: vi.fn().mockRejectedValue(new Error("offline")),
    };
    await expect(
      new RefineProseUseCase(llm).execute("expand", "abc"),
    ).rejects.toThrow("offline");
  });
});
