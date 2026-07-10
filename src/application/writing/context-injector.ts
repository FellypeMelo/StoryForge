import { SearchPort } from "../../domain/ports/search-port";
import { ProjectId } from "../../domain/value-objects/project-id";

/**
 * ContextInjector analyzes prose for mentioned entities and injects relevant
 * lore from the Story Codex, blending keyword RAG (FTS5) and semantic RAG
 * (sqlite-vec) candidates. Keyword hits win on entityId collisions, so
 * semantic search only contributes entities the keyword search missed.
 */
export class ContextInjector {
  constructor(
    private readonly keywordPort: SearchPort,
    private readonly semanticPort: SearchPort,
  ) {}

  async inject(projectId: ProjectId, text: string): Promise<string> {
    const entities = this.extractPotentialEntities(text);
    const snippetsByEntityId = new Map<string, string>();

    for (const entity of entities) {
      await this.collectTopHit(this.keywordPort, projectId, entity, snippetsByEntityId);
      await this.collectTopHit(this.semanticPort, projectId, entity, snippetsByEntityId);
    }

    if (snippetsByEntityId.size === 0) return "";

    const snippets = [...snippetsByEntityId.values()];
    return `\n\nSTORY CONTEXT (RAG):\n${snippets.map((s) => `- ${s}`).join("\n")}`;
  }

  // Keeps only the first snippet seen per entityId (keyword-first, since the
  // caller queries keywordPort before semanticPort for each entity).
  private async collectTopHit(
    port: SearchPort,
    projectId: ProjectId,
    entity: string,
    snippetsByEntityId: Map<string, string>,
  ): Promise<void> {
    const result = await port.search(projectId, entity);
    if (!result.success || result.data.length === 0) return;

    const topHit = result.data[0];
    if (snippetsByEntityId.has(topHit.entityId)) return;
    snippetsByEntityId.set(topHit.entityId, topHit.snippet);
  }

  // Heuristic: capitalized words / phrases likely naming an entity.
  private extractPotentialEntities(text: string): string[] {
    const words = text.match(/[A-Z][a-z]+(\s[A-Z][a-z]+)*/g) || [];
    return [...new Set(words)];
  }
}
