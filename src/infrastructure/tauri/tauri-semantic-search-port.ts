import { SearchPort, SearchResult, EntityType } from "../../domain/ports/search-port";
import { ProjectId } from "../../domain/value-objects/project-id";
import { Result, DomainError } from "../../domain/result";
import { SemanticIndexService } from "../../application/writing/semantic-index-service";
import { createSemanticIndexService } from "./semantic-index-service-factory";

const DEFAULT_TOP_K = 5;

/**
 * TauriSemanticSearchPort implements vector RAG through SemanticIndexService,
 * which picks between the real embedding path (llama.cpp, when configured
 * and enabled) and the offline Mock-embedding path exposed by the Rust
 * backend (`semantic_search_lore`). Optionally scoped to a single book.
 */
export class TauriSemanticSearchPort implements SearchPort {
  private readonly indexService: SemanticIndexService;

  constructor(
    private readonly bookId?: string,
    private readonly topK: number = DEFAULT_TOP_K,
    indexService?: SemanticIndexService,
  ) {
    this.indexService = indexService ?? createSemanticIndexService();
  }

  async search(
    projectId: ProjectId,
    query: string,
    _types?: EntityType[],
  ): Promise<Result<SearchResult[], DomainError>> {
    return this.indexService.search(projectId.value, this.bookId ?? null, query, this.topK);
  }
}
