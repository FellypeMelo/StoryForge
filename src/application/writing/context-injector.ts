import { SearchPort } from "../../domain/ports/search-port";
import { VectorSearchPort } from "../../domain/ports/vector-search-port";
import { ProjectId } from "../../domain/value-objects/project-id";

/**
 * ContextInjector analyzes prose for mentioned entities and injects relevant
 * lore from the Story Codex using keyword search (RAG). The vector port is held
 * for future semantic-similarity expansion of the candidate set.
 */
export class ContextInjector {
  // Vector port reserved for future semantic-similarity expansion of candidates.
  constructor(
    private readonly searchPort: SearchPort,
    _vectorSearchPort: VectorSearchPort,
  ) {}

  async inject(projectId: ProjectId, text: string): Promise<string> {
    const entities = this.extractPotentialEntities(text);
    const snippets: string[] = [];

    for (const entity of entities) {
      const result = await this.searchPort.search(projectId, entity);
      if (result.success && result.data.length > 0) {
        snippets.push(result.data[0].snippet);
      }
    }

    if (snippets.length === 0) return "";

    return `\n\nSTORY CONTEXT (RAG):\n${snippets.map((s) => `- ${s}`).join("\n")}`;
  }

  // Heuristic: capitalized words / phrases likely naming an entity.
  private extractPotentialEntities(text: string): string[] {
    const words = text.match(/[A-Z][a-z]+(\s[A-Z][a-z]+)*/g) || [];
    return [...new Set(words)];
  }
}
