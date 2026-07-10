import { EmbeddingPort } from "../../domain/ports/embedding-port";

export interface LlamaCppEmbeddingAdapterConfig {
  baseUrl: string;
  model?: string;
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "number");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

/**
 * LlamaCppEmbeddingAdapter targets the OpenAI-compatible embeddings
 * endpoint exposed by llama.cpp's server (POST /v1/embeddings), but
 * tolerates llama.cpp's own native response shapes too.
 */
export class LlamaCppEmbeddingAdapter implements EmbeddingPort {
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(config: LlamaCppEmbeddingAdapterConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.model = config.model ?? "";
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/v1/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, input: text }),
    });

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`);
    }

    const data: unknown = await response.json();
    const embedding = this.extractEmbedding(data);

    if (!embedding) {
      throw new Error("Embedding response inválida");
    }

    return embedding;
  }

  private extractEmbedding(data: unknown): number[] | null {
    const record = asRecord(data);
    const dataArray = record?.data;
    const firstFromData = Array.isArray(dataArray) ? asRecord(dataArray[0]) : null;
    const firstTopLevel = Array.isArray(data) ? asRecord(data[0]) : null;

    const candidates: unknown[] = [firstFromData?.embedding, record?.embedding, firstTopLevel?.embedding];

    return candidates.find(isNumberArray) ?? null;
  }
}
