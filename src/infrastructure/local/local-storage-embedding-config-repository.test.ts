import { describe, it, expect, beforeEach } from "vitest";
import { LocalStorageEmbeddingConfigRepository } from "./local-storage-embedding-config-repository";

describe("LocalStorageEmbeddingConfigRepository", () => {
  let repo: LocalStorageEmbeddingConfigRepository;

  beforeEach(() => {
    localStorage.clear();
    repo = new LocalStorageEmbeddingConfigRepository();
  });

  it("load retorna o default quando nada foi salvo", async () => {
    const result = await repo.load();

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.enabled).toBe(false);
    expect(result.data.baseUrl).toBe("http://127.0.0.1:8080");
    expect(result.data.model).toBe("");
  });

  it("save + load persiste e recupera a config", async () => {
    const saved = await repo.save({
      enabled: true,
      baseUrl: "http://127.0.0.1:9090",
      model: "nomic-embed-text",
    });
    expect(saved.success).toBe(true);

    const loaded = await repo.load();
    expect(loaded.success).toBe(true);
    if (!loaded.success) return;
    expect(loaded.data.enabled).toBe(true);
    expect(loaded.data.baseUrl).toBe("http://127.0.0.1:9090");
    expect(loaded.data.model).toBe("nomic-embed-text");
  });

  it("save sobrescreve a config anterior", async () => {
    await repo.save({ enabled: true, baseUrl: "http://a", model: "m1" });
    await repo.save({ enabled: false, baseUrl: "http://b", model: "m2" });

    const loaded = await repo.load();
    expect(loaded.success).toBe(true);
    if (!loaded.success) return;
    expect(loaded.data.baseUrl).toBe("http://b");
    expect(loaded.data.model).toBe("m2");
    expect(loaded.data.enabled).toBe(false);
  });

  it("dados corrompidos no storage retornam erro em vez de lançar", async () => {
    localStorage.setItem("storyforge_embedding_config", "{corrompido");

    const result = await repo.load();

    expect(result.success).toBe(false);
  });
});
