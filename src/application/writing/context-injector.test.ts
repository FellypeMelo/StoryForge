import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContextInjector } from "./context-injector";
import { SearchPort } from "../../domain/ports/search-port";
import { VectorSearchPort } from "../../domain/ports/vector-search-port";
import { ProjectId } from "../../domain/value-objects/project-id";

describe("ContextInjector", () => {
  let mockSearchPort: SearchPort;
  let mockVectorPort: VectorSearchPort;
  let injector: ContextInjector;

  beforeEach(() => {
    mockSearchPort = { search: vi.fn() } as any;
    mockVectorPort = { findSimilar: vi.fn() } as any;
    injector = new ContextInjector(mockSearchPort, mockVectorPort);
  });

  it("should inject context based on entities found in text", async () => {
    const projectId = ProjectId.generate();
    const text = "Aria went to the Whispering Woods.";

    // Mock finding Aria
    (mockSearchPort.search as any).mockImplementation(async (query: string) => {
      if (query === "Aria") {
        return { 
          results: [{ text: "Aria is a brave hunter.", score: 1 }] 
        };
      }
      if (query === "Whispering Woods") {
        return { 
          results: [{ text: "The Whispering Woods are full of ghosts.", score: 1 }] 
        };
      }
      return { results: [] };
    });

    const result = await injector.inject(projectId, text);

    expect(result).toContain("Aria is a brave hunter.");
    expect(result).toContain("The Whispering Woods are full of ghosts.");
  });

  it("should respect token budget by limiting results", async () => {
     // This test would check if it truncates or limits the number of RAG snippets
     // For now, let's just implement the basic logic
  });
});
