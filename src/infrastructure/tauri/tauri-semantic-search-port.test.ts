import { describe, it, expect, vi, beforeEach } from "vitest";
import { TauriSemanticSearchPort } from "./tauri-semantic-search-port";
import { EntityType } from "../../domain/ports/search-port";
import { ProjectId } from "../../domain/value-objects/project-id";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";

describe("TauriSemanticSearchPort", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mapeia o resultado snake_case do backend para o formato do domínio", async () => {
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue([
      { entity_id: "c1", entity_type: "character", snippet: "Nara", score: 0.12 },
      { entity_id: "l1", entity_type: "location", snippet: "Porto", score: 0.5 },
    ]);

    const port = new TauriSemanticSearchPort();
    const projectId = ProjectId.generate();
    const result = await port.search(projectId, "Nara");

    expect(result.success).toBe(true);
    if (!result.success) throw new Error("expected success");
    expect(result.data).toEqual([
      { entityId: "c1", type: EntityType.Character, snippet: "Nara", score: 0.12 },
      { entityId: "l1", type: EntityType.Location, snippet: "Porto", score: 0.5 },
    ]);
    expect(invoke).toHaveBeenCalledWith("semantic_search_lore", {
      projectId: projectId.value,
      bookId: null,
      query: "Nara",
      topK: 5,
    });
  });

  it("assume score 0 quando o backend não o fornece", async () => {
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue([
      { entity_id: "c1", entity_type: "character", snippet: "Nara" },
    ]);

    const port = new TauriSemanticSearchPort();
    const result = await port.search(ProjectId.generate(), "Nara");

    if (!result.success) throw new Error("expected success");
    expect(result.data[0].score).toBe(0);
  });

  it("escopa por livro e usa o topK configurado", async () => {
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const port = new TauriSemanticSearchPort("book-42", 8);
    const projectId = ProjectId.generate();
    await port.search(projectId, "algo");

    expect(invoke).toHaveBeenCalledWith("semantic_search_lore", {
      projectId: projectId.value,
      bookId: "book-42",
      query: "algo",
      topK: 8,
    });
  });

  it("retorna falha quando o backend lança", async () => {
    (invoke as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db locked"));

    const port = new TauriSemanticSearchPort();
    const result = await port.search(ProjectId.generate(), "x");

    expect(result.success).toBe(false);
    if (result.success) throw new Error("expected failure");
    expect(result.error.message).toContain("db locked");
  });
});
