import { describe, it, expect, vi, beforeEach } from "vitest";
import { MultiPerspectiveUseCase } from "./multi-perspective";
import { LlmPort } from "../../domain/ideation/ports/llm-port";

describe("MultiPerspectiveUseCase", () => {
  let llmPort: LlmPort;
  let useCase: MultiPerspectiveUseCase;

  beforeEach(() => {
    llmPort = {
      complete: vi.fn(),
    };
    useCase = new MultiPerspectiveUseCase(llmPort);
  });

  it("returns 3 stylistic variations parsed from the LLM response", async () => {
    (llmPort.complete as any).mockResolvedValue({
      text: JSON.stringify({
        cinico: "Ele morreu. Fim de papo.",
        sensorial: "O cheiro de ferro quente pairava no ar, e o silêncio zumbia nos ouvidos.",
        poetico: "Como folhas que caem, assim se foi — devagar, depois, tudo de uma vez.",
      }),
    });

    const result = await useCase.execute("Ele morreu na sala, sozinho.");

    expect(result.variations).toHaveLength(3);
    const styles = result.variations.map((v) => v.style).sort();
    expect(styles).toEqual(["cinico", "poetico", "sensorial"]);

    const cinico = result.variations.find((v) => v.style === "cinico")!;
    expect(cinico.text).toBe("Ele morreu. Fim de papo.");
    expect(cinico.label.length).toBeGreaterThan(0);

    const sensorial = result.variations.find((v) => v.style === "sensorial")!;
    expect(sensorial.text).toContain("cheiro de ferro");

    const poetico = result.variations.find((v) => v.style === "poetico")!;
    expect(poetico.text).toContain("folhas que caem");
  });

  it("handles field-type drift gracefully (e.g. text returned as array)", async () => {
    (llmPort.complete as any).mockResolvedValue({
      text: JSON.stringify({
        cinico: ["Ele morreu.", "Fim de papo."],
        sensorial: "Cheiro de ferro no ar.",
        poetico: "Como folhas que caem.",
      }),
    });

    const result = await useCase.execute("Ele morreu na sala, sozinho.");

    const cinico = result.variations.find((v) => v.style === "cinico")!;
    expect(cinico.text).toContain("Ele morreu.");
    expect(cinico.text).toContain("Fim de papo.");
  });

  it("tolerates prose/markdown wrapping around the JSON payload", async () => {
    (llmPort.complete as any).mockResolvedValue({
      text:
        "Aqui estão as variações:\n```json\n" +
        JSON.stringify({
          cinico: "Frio e direto.",
          sensorial: "Sons e cheiros.",
          poetico: "Verso e cadência.",
        }) +
        "\n```\nEspero que ajude!",
    });

    const result = await useCase.execute("Trecho de exemplo.");

    expect(result.variations).toHaveLength(3);
    expect(result.variations.find((v) => v.style === "poetico")!.text).toBe("Verso e cadência.");
  });

  it("throws a clear error when the LLM response has no usable content", async () => {
    (llmPort.complete as any).mockResolvedValue({ text: "" });

    await expect(useCase.execute("Trecho de exemplo.")).rejects.toThrow();
  });

  it("throws a clear error when the LLM response is not JSON at all", async () => {
    (llmPort.complete as any).mockResolvedValue({ text: "desculpe, não posso ajudar" });

    await expect(useCase.execute("Trecho de exemplo.")).rejects.toThrow();
  });

  it("degrades gracefully on an empty excerpt without an unhandled throw", async () => {
    const result = await useCase.execute("");

    expect(result.variations).toHaveLength(3);
    expect(result.variations.every((v) => v.text === "")).toBe(true);
    expect(llmPort.complete).not.toHaveBeenCalled();
  });
});
