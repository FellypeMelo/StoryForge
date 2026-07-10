import { EmbeddingConfigRepository } from "../../domain/ports/embedding-config-repository";
import { EmbeddingConfig } from "../../domain/embedding-config";
import { EmbeddingPort } from "../../domain/ports/embedding-port";
import { SearchResult, EntityType } from "../../domain/ports/search-port";
import { Result, DomainError } from "../../domain/result";

/** Builds the concrete embedding adapter for a given (validated) config. */
export type EmbeddingPortFactory = (config: EmbeddingConfig) => EmbeddingPort;

/** Minimal shape of Tauri's `invoke` this service depends on — injectable for tests. */
export type InvokeFn = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;

interface RawIndexRow {
  entity_id: string;
  text: string;
}

interface RawSearchResult {
  entity_id: string;
  entity_type: string;
  snippet: string;
  score?: number;
}

function toDomainError(error: unknown): DomainError {
  if (error instanceof DomainError) return error;
  if (error instanceof Error) return new DomainError(error.message);
  return new DomainError(String(error));
}

function mapResults(raw: RawSearchResult[]): SearchResult[] {
  return raw.map((r) => ({
    entityId: r.entity_id,
    type: r.entity_type as EntityType,
    snippet: r.snippet,
    score: r.score ?? 0,
  }));
}

/**
 * SemanticIndexService is the single place that decides between the real
 * embedding path (llama.cpp, via EmbeddingConfig.enabled) and the offline
 * Mock-embedding path baked into the Rust backend. Both reindex() and
 * search() fall back to the offline commands whenever embeddings are
 * disabled, so the app degrades gracefully without a local model server.
 */
export class SemanticIndexService {
  constructor(
    private readonly configRepo: EmbeddingConfigRepository,
    private readonly createEmbeddingPort: EmbeddingPortFactory,
    private readonly invokeFn: InvokeFn,
  ) {}

  async reindex(projectId: string, bookId: string | null): Promise<Result<number, DomainError>> {
    const configResult = await this.configRepo.load();
    if (!configResult.success) return { success: false, error: toDomainError(configResult.error) };
    const config = configResult.data;

    try {
      if (!config.enabled) {
        const count = await this.invokeFn<number>("reindex_lore_vectors", { projectId, bookId });
        return { success: true, data: count };
      }
      return { success: true, data: await this.reindexWithRealEmbeddings(projectId, bookId, config) };
    } catch (error) {
      return { success: false, error: toDomainError(error) };
    }
  }

  async search(
    projectId: string,
    bookId: string | null,
    query: string,
    topK: number,
  ): Promise<Result<SearchResult[], DomainError>> {
    const configResult = await this.configRepo.load();
    if (!configResult.success) return { success: false, error: toDomainError(configResult.error) };
    const config = configResult.data;

    try {
      if (!config.enabled) {
        const raw = await this.invokeFn<RawSearchResult[]>("semantic_search_lore", {
          projectId,
          bookId,
          query,
          topK,
        });
        return { success: true, data: mapResults(raw) };
      }
      return {
        success: true,
        data: await this.searchWithRealEmbeddings(projectId, bookId, query, topK, config),
      };
    } catch (error) {
      return { success: false, error: toDomainError(error) };
    }
  }

  private async reindexWithRealEmbeddings(
    projectId: string,
    bookId: string | null,
    config: EmbeddingConfig,
  ): Promise<number> {
    const embeddingPort = this.createEmbeddingPort(config);
    const rows = await this.invokeFn<RawIndexRow[]>("list_lore_index_rows", { projectId, bookId });

    const embeddings: number[][] = [];
    for (const row of rows) {
      embeddings.push(await embeddingPort.embed(row.text));
    }

    return this.invokeFn<number>("store_lore_vectors", {
      rows: rows.map((row, i) => ({ entity_id: row.entity_id, embedding: embeddings[i] })),
    });
  }

  private async searchWithRealEmbeddings(
    projectId: string,
    bookId: string | null,
    query: string,
    topK: number,
    config: EmbeddingConfig,
  ): Promise<SearchResult[]> {
    const embeddingPort = this.createEmbeddingPort(config);
    const embedding = await embeddingPort.embed(query);
    const raw = await this.invokeFn<RawSearchResult[]>("semantic_search_by_vector", {
      projectId,
      bookId,
      embedding,
      topK,
    });
    return mapResults(raw);
  }
}
