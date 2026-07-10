import { describe, it, expect } from "vitest";
import { UnreliableNarratorPromptEnhancer } from "./unreliable-narrator-prompt-enhancer";
import { UnreliableNarratorConfig } from "./unreliable-narrator-config";

describe("UnreliableNarratorPromptEnhancer", () => {
  it("appends the action/narration divergence fragment when active", () => {
    const base = "Escreva a cena em primeira pessoa.";
    const config = UnreliableNarratorConfig.create({
      highNeuroticism: true,
      dissonance: true,
      selfPerception: "Acredita que sempre age com nobreza",
    });

    const enhanced = UnreliableNarratorPromptEnhancer.enhance(base, config);

    expect(enhanced).toContain(base);
    expect(enhanced).not.toBe(base);
    expect(enhanced.toUpperCase()).toContain("AÇÃO");
    expect(enhanced.toUpperCase()).toContain("NARRAÇÃO");
    expect(enhanced.toLowerCase()).toContain("nunca reconhece");
    expect(enhanced).toContain("Acredita que sempre age com nobreza");
  });

  it("returns the base prompt unchanged when inactive", () => {
    const base = "Escreva a cena em primeira pessoa.";
    const config = UnreliableNarratorConfig.create({
      highNeuroticism: false,
      dissonance: false,
      selfPerception: "Acredita que sempre age com nobreza",
    });

    const enhanced = UnreliableNarratorPromptEnhancer.enhance(base, config);

    expect(enhanced).toBe(base);
  });

  it("degrades gracefully on empty base prompt when active", () => {
    const config = UnreliableNarratorConfig.create({
      highNeuroticism: true,
      dissonance: true,
      selfPerception: "Acredita que sempre age com nobreza",
    });

    expect(() => UnreliableNarratorPromptEnhancer.enhance("", config)).not.toThrow();
    expect(UnreliableNarratorPromptEnhancer.enhance("", config).toLowerCase()).toContain(
      "nunca reconhece",
    );
  });
});
