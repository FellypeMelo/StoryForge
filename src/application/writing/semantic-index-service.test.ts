import { describe, it, expect, vi, beforeEach } from "vitest";
import { SemanticIndexService } from "./semantic-index-service";
import { EmbeddingConfigRepository } from "../../domain/ports/embedding-config-repository";
import { EmbeddingConfig } from "../../domain/embedding-config";
import { EmbeddingPort } from "../../domain/ports/embedding-port";
import { EntityType } from "../../domain/ports/search-port";

function repoWith(config: EmbeddingConfig): EmbeddingConfigRepository {
  return {
    load: vi.fn().mockResolvedValue({ success: true, data: config }),
    save: vi.fn(),
  };
}

describe("SemanticIndexService", () => {
  let invokeFn: ReturnType<typeof vi.fn>;
  let fakeAdapter: EmbeddingPort;
  let createEmbeddingPort: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    invokeFn = vi.fn();
    fakeAdapter = { embed: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]) };
    createEmbeddingPort = vi.fn().mockReturnValue(fakeAdapter);
  });

  describe("reindex", () => {
    it("modo offline (desabilitado): delega para reindex_lore_vectors e retorna a contagem", async () => {
      const repo = repoWith(EmbeddingConfig.create({ enabled: false, baseUrl: "", model: "" }));
      invokeFn.mockResolvedValue(7);

      const service = new SemanticIndexService(repo, createEmbeddingPort, invokeFn);
      const result = await service.reindex("proj-1", "book-1");

      expect(result).toEqual({ success: true, data: 7 });
      expect(invokeFn).toHaveBeenCalledWith("reindex_lore_vectors", {
        projectId: "proj-1",
        bookId: "book-1",
      });
      expect(createEmbeddingPort).not.toHaveBeenCalled();
    });

    it("modo real (habilitado): lista linhas, gera embeddings e armazena via store_lore_vectors", async () => {
      const config = EmbeddingConfig.create({
        enabled: true,
        baseUrl: "http://127.0.0.1:8080",
        model: "nomic-embed-text",
      });
      const repo = repoWith(config);
      invokeFn.mockImplementation(async (cmd: string) => {
        if (cmd === "list_lore_index_rows") {
          return [
            { entity_id: "c1", text: "Alaric" },
            { entity_id: "l1", text: "Porto" },
          ];
        }
        if (cmd === "store_lore_vectors") return 2;
        throw new Error(`comando inesperado: ${cmd}`);
      });
      (fakeAdapter.embed as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce([0.1, 0.2])
        .mockResolvedValueOnce([0.3, 0.4]);

      const service = new SemanticIndexService(repo, createEmbeddingPort, invokeFn);
      const result = await service.reindex("proj-1", null);

      expect(result).toEqual({ success: true, data: 2 });
      expect(createEmbeddingPort).toHaveBeenCalledWith(config);
      expect(invokeFn).toHaveBeenCalledWith("list_lore_index_rows", {
        projectId: "proj-1",
        bookId: null,
      });
      expect(invokeFn).toHaveBeenCalledWith("store_lore_vectors", {
        rows: [
          { entity_id: "c1", embedding: [0.1, 0.2] },
          { entity_id: "l1", embedding: [0.3, 0.4] },
        ],
      });
    });

    it("retorna erro gracioso quando o adapter de embedding lança", async () => {
      const repo = repoWith(
        EmbeddingConfig.create({ enabled: true, baseUrl: "http://127.0.0.1:8080", model: "" }),
      );
      invokeFn.mockResolvedValue([{ entity_id: "c1", text: "Alaric" }]);
      (fakeAdapter.embed as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));

      const service = new SemanticIndexService(repo, createEmbeddingPort, invokeFn);
      const result = await service.reindex("proj-1", null);

      expect(result.success).toBe(false);
      if (result.success) throw new Error("expected failure");
      expect(result.error.message).toContain("offline");
    });

    it("propaga erro quando a configuração falha ao carregar", async () => {
      const repo: EmbeddingConfigRepository = {
        load: vi.fn().mockResolvedValue({ success: false, error: new Error("corrompido") }),
        save: vi.fn(),
      };

      const service = new SemanticIndexService(repo, createEmbeddingPort, invokeFn);
      const result = await service.reindex("proj-1", null);

      expect(result.success).toBe(false);
      if (result.success) throw new Error("expected failure");
      expect(result.error.message).toContain("corrompido");
      expect(invokeFn).not.toHaveBeenCalled();
    });
  });

  describe("search", () => {
    it("modo offline: delega para semantic_search_lore e mapeia snake_case para o domínio", async () => {
      const repo = repoWith(EmbeddingConfig.create({ enabled: false, baseUrl: "", model: "" }));
      invokeFn.mockResolvedValue([
        { entity_id: "c1", entity_type: "character", snippet: "Alaric", score: 0.2 },
      ]);

      const service = new SemanticIndexService(repo, createEmbeddingPort, invokeFn);
      const result = await service.search("proj-1", "book-1", "Alaric", 5);

      expect(result).toEqual({
        success: true,
        data: [{ entityId: "c1", type: EntityType.Character, snippet: "Alaric", score: 0.2 }],
      });
      expect(invokeFn).toHaveBeenCalledWith("semantic_search_lore", {
        projectId: "proj-1",
        bookId: "book-1",
        query: "Alaric",
        topK: 5,
      });
      expect(createEmbeddingPort).not.toHaveBeenCalled();
    });

    it("assume score 0 quando o backend não o fornece", async () => {
      const repo = repoWith(EmbeddingConfig.create({ enabled: false, baseUrl: "", model: "" }));
      invokeFn.mockResolvedValue([{ entity_id: "c1", entity_type: "character", snippet: "Alaric" }]);

      const service = new SemanticIndexService(repo, createEmbeddingPort, invokeFn);
      const result = await service.search("proj-1", null, "Alaric", 5);

      if (!result.success) throw new Error("expected success");
      expect(result.data[0].score).toBe(0);
    });

    it("modo real: gera embedding da consulta e chama semantic_search_by_vector", async () => {
      const repo = repoWith(
        EmbeddingConfig.create({ enabled: true, baseUrl: "http://127.0.0.1:8080", model: "" }),
      );
      (fakeAdapter.embed as ReturnType<typeof vi.fn>).mockResolvedValue([0.5, 0.6]);
      invokeFn.mockResolvedValue([
        { entity_id: "l1", entity_type: "location", snippet: "Porto", score: 0.1 },
      ]);

      const service = new SemanticIndexService(repo, createEmbeddingPort, invokeFn);
      const result = await service.search("proj-1", null, "Porto", 3);

      expect(invokeFn).toHaveBeenCalledWith("semantic_search_by_vector", {
        projectId: "proj-1",
        bookId: null,
        embedding: [0.5, 0.6],
        topK: 3,
      });
      expect(result).toEqual({
        success: true,
        data: [{ entityId: "l1", type: EntityType.Location, snippet: "Porto", score: 0.1 }],
      });
    });

    it("retorna erro gracioso quando o adapter lança na busca", async () => {
      const repo = repoWith(
        EmbeddingConfig.create({ enabled: true, baseUrl: "http://127.0.0.1:8080", model: "" }),
      );
      (fakeAdapter.embed as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("timeout"));

      const service = new SemanticIndexService(repo, createEmbeddingPort, invokeFn);
      const result = await service.search("proj-1", null, "Porto", 3);

      expect(result.success).toBe(false);
      if (result.success) throw new Error("expected failure");
      expect(result.error.message).toContain("timeout");
      expect(invokeFn).not.toHaveBeenCalled();
    });
  });
});
