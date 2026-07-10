import { invoke } from "@tauri-apps/api/core";
import { SemanticIndexService } from "../../application/writing/semantic-index-service";
import { LocalStorageEmbeddingConfigRepository } from "../local/local-storage-embedding-config-repository";
import { LlamaCppEmbeddingAdapter } from "../llm/llamacpp-embedding-adapter";
import { EmbeddingConfig } from "../../domain/embedding-config";

/**
 * Single composition point for SemanticIndexService in production code —
 * both TauriSemanticSearchPort and CodexDashboard go through this so the
 * real-vs-offline embedding wiring only lives in one place.
 */
export function createSemanticIndexService(): SemanticIndexService {
  return new SemanticIndexService(
    new LocalStorageEmbeddingConfigRepository(),
    (config: EmbeddingConfig) =>
      new LlamaCppEmbeddingAdapter({ baseUrl: config.baseUrl, model: config.model }),
    invoke,
  );
}
