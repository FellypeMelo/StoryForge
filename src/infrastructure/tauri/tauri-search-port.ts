import { invoke } from "@tauri-apps/api/core";
import {
  SearchPort,
  SearchResult,
  EntityType,
} from "../../domain/ports/search-port";
import { ProjectId } from "../../domain/value-objects/project-id";
import { Result, DomainError } from "../../domain/result";

/** Shape returned by the Rust `search_lore` command (snake_case serde). */
interface RawSearchResult {
  entity_id: string;
  entity_type: string;
  snippet: string;
  score?: number;
}

/**
 * TauriSearchPort implements keyword RAG by calling the backend `search_lore`
 * command (FTS5 full-text search over the Story Codex). Optionally scoped to a
 * single book.
 */
export class TauriSearchPort implements SearchPort {
  constructor(private readonly bookId?: string) {}

  async search(
    projectId: ProjectId,
    query: string,
    _types?: EntityType[],
  ): Promise<Result<SearchResult[], DomainError>> {
    try {
      const raw = await invoke<RawSearchResult[]>("search_lore", {
        projectId: projectId.value,
        bookId: this.bookId ?? null,
        query,
      });

      const data: SearchResult[] = raw.map((r) => ({
        entityId: r.entity_id,
        type: r.entity_type as EntityType,
        snippet: r.snippet,
        score: r.score ?? 0,
      }));

      return { success: true, data };
    } catch (error) {
      return { success: false, error: new DomainError(String(error)) };
    }
  }
}
