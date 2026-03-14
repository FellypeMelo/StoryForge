import { describe, it, expect, vi, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { TauriBlacklistRepository } from "./tauri-blacklist-repository";
import { BlacklistEntry } from "../../domain/blacklist-entry";
import { ProjectId } from "../../domain/value-objects/project-id";
import { BlacklistEntryId } from "../../domain/value-objects/codex-ids";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

describe("TauriBlacklistRepository", () => {
  const repository = new TauriBlacklistRepository();
  const projectId = ProjectId.create("550e8400-e29b-41d4-a716-446655440000");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should save a blacklist entry", async () => {
    const entry = BlacklistEntry.create({
      id: BlacklistEntryId.generate(),
      projectId,
      term: "Cliche",
      category: "Style",
    });

    vi.mocked(invoke).mockResolvedValue({ id: "new-id" });

    const result = await repository.save(entry);

    expect(result.success).toBe(true);
    expect(invoke).toHaveBeenCalledWith("create_blacklist_entry", expect.objectContaining({
      term: "Cliche",
    }));
  });

  it("should find an entry by id", async () => {
    const entryId = BlacklistEntryId.generate();
    vi.mocked(invoke).mockResolvedValue({
      id: entryId.value,
      project_id: projectId.value,
      term: "Bad Word",
      category: "Language",
    });

    const result = await repository.findById(entryId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.term).toBe("Bad Word");
      expect(result.data.id.value).toBe(entryId.value);
    }
  });

  it("should list entries by project", async () => {
    const id1 = BlacklistEntryId.generate().value;
    const id2 = BlacklistEntryId.generate().value;
    vi.mocked(invoke).mockResolvedValue([
      { id: id1, project_id: projectId.value, term: "T1", category: "C1" },
      { id: id2, project_id: projectId.value, term: "T2", category: "C2" },
    ]);

    const result = await repository.findByProject(projectId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0].term).toBe("T1");
    }
  });

  it("should delete an entry", async () => {
    const entryId = BlacklistEntryId.generate();
    vi.mocked(invoke).mockResolvedValue(undefined);

    const result = await repository.delete(entryId);

    expect(result.success).toBe(true);
    expect(invoke).toHaveBeenCalledWith("delete_blacklist_entry", { id: entryId.value });
  });
});
