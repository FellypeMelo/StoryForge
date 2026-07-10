import { LlmPort } from "../../domain/ideation/ports/llm-port";
import { extractJson, asText } from "../shared/extract-json";

export type PerspectiveStyle = "cinico" | "sensorial" | "poetico";

export interface PerspectiveVariation {
  style: PerspectiveStyle;
  label: string;
  text: string;
}

export interface MultiPerspectiveResult {
  variations: PerspectiveVariation[];
}

const STYLE_LABELS: Record<PerspectiveStyle, string> = {
  cinico: "Tom Cínico e Seco",
  sensorial: "Foco Sensorial",
  poetico: "Poético e Cadenciado",
};

const STYLE_ORDER: PerspectiveStyle[] = ["cinico", "sensorial", "poetico"];

export class MultiPerspectiveUseCase {
  constructor(private readonly llmPort: LlmPort) {}

  async execute(excerpt: string): Promise<MultiPerspectiveResult> {
    if (!excerpt.trim()) {
      return { variations: this.emptyVariations() };
    }

    const prompt = this.buildPrompt(excerpt);
    const response = await this.llmPort.complete(prompt, {
      temperature: 0.9,
      maxTokens: 2000,
    });

    return this.parseResponse(response.text);
  }

  private buildPrompt(excerpt: string): string {
    return `Você é um editor literário especialista em reescrita estilística (Multi-Perspective Stylization).

TRECHO ORIGINAL:
${excerpt}

Reescreva o trecho acima em TRÊS variações estilísticas distintas, preservando os eventos da cena mas alterando completamente o tom e a textura da prosa:
A) CÍNICO: tom cínico e seco, distanciado, sem sentimentalismo.
B) SENSORIAL: foco em sons, cheiros, texturas e sensações físicas.
C) POÉTICO: cadência poética, imagens líricas, ritmo cuidadoso.

Responda apenas como JSON:
{"cinico": "...", "sensorial": "...", "poetico": "..."}`;
  }

  private parseResponse(text: string): MultiPerspectiveResult {
    let raw: Record<string, unknown>;
    try {
      raw = extractJson<Record<string, unknown>>(text);
    } catch {
      throw new Error(`Falha ao interpretar resposta do LLM: ${text.substring(0, 100)}`);
    }

    const variations = STYLE_ORDER.map((style) => ({
      style,
      label: STYLE_LABELS[style],
      text: asText(raw[style]),
    }));

    if (variations.every((v) => !v.text)) {
      throw new Error("O LLM não retornou nenhuma variação de perspectiva válida");
    }

    return { variations };
  }

  private emptyVariations(): PerspectiveVariation[] {
    return STYLE_ORDER.map((style) => ({
      style,
      label: STYLE_LABELS[style],
      text: "",
    }));
  }
}
