import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContextInjector } from "./context-injector";
import { SearchPort, EntityType, SearchResult } from "../../domain/ports/search-port";
import { VectorSearchPort } from "../../domain/ports/vector-search-port";
import { ProjectId } from "../../domain/value-objects/project-id";
import { Result, DomainError } from "../../domain/result";

function ok(results: SearchResult[]): Result<SearchResult[], DomainError> {
  return { success: true, data: results };
}

function result(entityId: string, snippet: string): SearchResult {
  return { entityId, type: EntityType.Character, snippet, score: 1 };
}

describe("ContextInjector", () => {
  let mockSearchPort: SearchPort;
  let mockVectorPort: VectorSearchPort;
  let injector: ContextInjector;

  beforeEach(() => {
    mockSearchPort = { search: vi.fn() };
    mockVectorPort = { findSimilar: vi.fn() };
    injector = new ContextInjector(mockSearchPort, mockVectorPort);
  });

  it("injeta contexto com base nas entidades encontradas no texto", async () => {
    const projectId = ProjectId.generate();
    const text = "Aria went to the Whispering Woods.";

    (mockSearchPort.search as ReturnType<typeof vi.fn>).mockImplementation(
      async (_p: ProjectId, query: string) => {
        if (query === "Aria") return ok([result("c1", "Aria is a brave hunter.")]);
        if (query === "Whispering Woods")
          return ok([result("l1", "The Whispering Woods are full of ghosts.")]);
        return ok([]);
      },
    );

    const output = await injector.inject(projectId, text);

    expect(output).toContain("Aria is a brave hunter.");
    expect(output).toContain("The Whispering Woods are full of ghosts.");
  });

  it("retorna vazio quando nenhuma entidade tem lore", async () => {
    const projectId = ProjectId.generate();
    (mockSearchPort.search as ReturnType<typeof vi.fn>).mockResolvedValue(ok([]));

    const output = await injector.inject(projectId, "Nothing Relevant Here");
    expect(output).toBe("");
  });

  it("ignora falhas de busca sem lançar", async () => {
    const projectId = ProjectId.generate();
    (mockSearchPort.search as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: new DomainError("busca falhou"),
    });

    const output = await injector.inject(projectId, "Aria walks.");
    expect(output).toBe("");
  });

  it("passa o projectId para a busca (escopo correto)", async () => {
    const projectId = ProjectId.generate();
    const searchSpy = mockSearchPort.search as ReturnType<typeof vi.fn>;
    searchSpy.mockResolvedValue(ok([]));

    await injector.inject(projectId, "Aria walks.");

    expect(searchSpy).toHaveBeenCalledWith(projectId, "Aria");
  });
});
