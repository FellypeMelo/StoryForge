import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContextInjector } from "./context-injector";
import { SearchPort, EntityType, SearchResult } from "../../domain/ports/search-port";
import { ProjectId } from "../../domain/value-objects/project-id";
import { Result, DomainError } from "../../domain/result";

function ok(results: SearchResult[]): Result<SearchResult[], DomainError> {
  return { success: true, data: results };
}

function result(entityId: string, snippet: string): SearchResult {
  return { entityId, type: EntityType.Character, snippet, score: 1 };
}

describe("ContextInjector", () => {
  let mockKeywordPort: SearchPort;
  let mockSemanticPort: SearchPort;
  let injector: ContextInjector;

  beforeEach(() => {
    mockKeywordPort = { search: vi.fn().mockResolvedValue(ok([])) };
    mockSemanticPort = { search: vi.fn().mockResolvedValue(ok([])) };
    injector = new ContextInjector(mockKeywordPort, mockSemanticPort);
  });

  it("injeta contexto com base nas entidades encontradas no texto (busca por palavra-chave)", async () => {
    const projectId = ProjectId.generate();
    const text = "Aria went to the Whispering Woods.";

    (mockKeywordPort.search as ReturnType<typeof vi.fn>).mockImplementation(
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

  it("inclui achados apenas do port semântico e remove duplicatas mantendo o snippet do keyword", async () => {
    const projectId = ProjectId.generate();
    const text = "Aria walked near the Whispering Woods at dusk.";

    (mockKeywordPort.search as ReturnType<typeof vi.fn>).mockImplementation(
      async (_p: ProjectId, query: string) => {
        if (query === "Aria") return ok([result("c1", "Aria (keyword): brave hunter.")]);
        return ok([]);
      },
    );

    (mockSemanticPort.search as ReturnType<typeof vi.fn>).mockImplementation(
      async (_p: ProjectId, query: string) => {
        if (query === "Aria")
          return ok([result("c1", "Aria (semantic): should be ignored, keyword wins.")]);
        if (query === "Whispering Woods")
          return ok([result("l1", "Whispering Woods (semantic): eerie forest.")]);
        return ok([]);
      },
    );

    const output = await injector.inject(projectId, text);

    expect(output).toContain("Aria (keyword): brave hunter.");
    expect(output).not.toContain("Aria (semantic)");
    expect(output).toContain("Whispering Woods (semantic): eerie forest.");
  });

  it("retorna vazio quando nenhuma entidade tem lore em nenhum dos ports", async () => {
    const projectId = ProjectId.generate();

    const output = await injector.inject(projectId, "Nothing Relevant Here");
    expect(output).toBe("");
  });

  it("ignora falhas de busca sem lançar", async () => {
    const projectId = ProjectId.generate();
    (mockKeywordPort.search as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: new DomainError("busca falhou"),
    });
    (mockSemanticPort.search as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: new DomainError("busca semântica falhou"),
    });

    const output = await injector.inject(projectId, "Aria walks.");
    expect(output).toBe("");
  });

  it("passa o projectId para as duas buscas (escopo correto)", async () => {
    const projectId = ProjectId.generate();

    await injector.inject(projectId, "Aria walks.");

    expect(mockKeywordPort.search).toHaveBeenCalledWith(projectId, "Aria");
    expect(mockSemanticPort.search).toHaveBeenCalledWith(projectId, "Aria");
  });
});
