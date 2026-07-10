import { VectorSearchPort } from "../../domain/ports/vector-search-port";
import { SearchResult } from "../../domain/ports/search-port";
import { Result, DomainError } from "../../domain/result";

/**
 * No-op VectorSearchPort. Semantic (embedding-based) similarity is not yet
 * populated in the backend `lore_vectors` table, so this returns no candidates.
 * Keyword RAG via {@link TauriSearchPort} remains the active retrieval path.
 */
export class NullVectorSearchPort implements VectorSearchPort {
  async findSimilar(): Promise<Result<SearchResult[], DomainError>> {
    return { success: true, data: [] };
  }
}
