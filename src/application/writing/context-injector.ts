import { SearchPort } from "../../domain/ports/search-port";
import { VectorSearchPort } from "../../domain/ports/vector-search-port";
import { ProjectId } from "../../domain/value-objects/project-id";

/**
 * ContextInjector is a use case that analyzes text for mentioned entities
 * and injects relevant lore from the Story Codex using RAG.
 */
export class ContextInjector {
  constructor(
    private readonly searchPort: SearchPort,
    private readonly vectorSearchPort: VectorSearchPort
  ) {}

  async inject(projectId: ProjectId, text: string): Promise<string> {
    // Basic entity detection (simplified for this implementation)
    // In a real scenario, this could use an NLP port or a list of known entities
    const potentialEntities = this.extractPotentialEntities(text);
    
    const loreSnippets: string[] = [];
    
    for (const entity of potentialEntities) {
      const searchResult = await this.searchPort.search(entity, "all");
      if (searchResult.results.length > 0) {
        loreSnippets.push(searchResult.results[0].text);
      }
    }

    if (loreSnippets.length === 0) {
      return "";
    }

    return `\n\nSTORY CONTEXT (RAG):\n${loreSnippets.map(s => `- ${s}`).join("\n")}`;
  }

  private extractPotentialEntities(text: string): string[] {
    // Very simple heuristic: Capitalized words/phrases that are not at the start of a sentence
    // or just all capitalized words for now as a starting point.
    const words = text.match(/[A-Z][a-z]+(\s[A-Z][a-z]+)*/g) || [];
    return [...new Set(words)]; // Unique entities
  }
}
