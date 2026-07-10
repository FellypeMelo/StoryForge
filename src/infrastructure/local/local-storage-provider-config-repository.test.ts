import { describe, it, expect, beforeEach } from "vitest";
import { LocalStorageProviderConfigRepository } from "./local-storage-provider-config-repository";
import { ProviderConfig } from "../../domain/ports/provider-config-repository";

describe("LocalStorageProviderConfigRepository", () => {
  let repo: LocalStorageProviderConfigRepository;

  const llamaConfig: ProviderConfig = {
    providerId: "llamacpp",
    baseUrl: "http://localhost:8080",
    defaultModel: "local",
    isActive: true,
  };

  beforeEach(() => {
    localStorage.clear();
    repo = new LocalStorageProviderConfigRepository();
  });

  it("listAll retorna vazio quando nada salvo", async () => {
    const result = await repo.listAll();
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual([]);
  });

  it("save + findByProvider persiste e recupera config", async () => {
    const saved = await repo.save(llamaConfig);
    expect(saved.success).toBe(true);

    const found = await repo.findByProvider("llamacpp");
    expect(found.success).toBe(true);
    if (found.success) expect(found.data).toEqual(llamaConfig);
  });

  it("save sobrescreve config do mesmo provider", async () => {
    await repo.save(llamaConfig);
    await repo.save({ ...llamaConfig, baseUrl: "http://localhost:9090" });

    const all = await repo.listAll();
    if (!all.success) throw new Error("expected success");
    expect(all.data).toHaveLength(1);
    expect(all.data[0].baseUrl).toBe("http://localhost:9090");
  });

  it("findByProvider retorna null para provider desconhecido", async () => {
    const found = await repo.findByProvider("openai");
    expect(found.success).toBe(true);
    if (found.success) expect(found.data).toBeNull();
  });

  it("dados corrompidos no storage retornam erro em vez de lançar", async () => {
    localStorage.setItem("storyforge_provider_configs", "{corrompido");
    const result = await repo.listAll();
    expect(result.success).toBe(false);
  });
});
