import { describe, it, expect, vi, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { TauriWorldRuleRepository } from "./tauri-world-rule-repository";
import { WorldRule } from "../../domain/world-rule";
import { ProjectId } from "../../domain/value-objects/project-id";
import { WorldRuleId } from "../../domain/value-objects/codex-ids";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

describe("TauriWorldRuleRepository", () => {
  const bookId = "550e8400-e29b-41d4-a716-446655440001";
  const repository = new TauriWorldRuleRepository(bookId);
  const projectId = ProjectId.create("550e8400-e29b-41d4-a716-446655440000");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should save a world rule", async () => {
    const rule = WorldRule.create({
      id: WorldRuleId.generate(),
      projectId,
      category: "Magic",
      content: "Magic costs energy",
    });

    vi.mocked(invoke).mockResolvedValue({ id: "new-id" });

    const result = await repository.save(rule);

    expect(result.success).toBe(true);
    expect(invoke).toHaveBeenCalledWith("create_world_rule", expect.objectContaining({
      category: "Magic",
      content: "Magic costs energy",
    }));
  });

  it("should find a rule by id", async () => {
    const ruleId = WorldRuleId.generate();
    vi.mocked(invoke).mockResolvedValue({
      id: ruleId.value,
      project_id: projectId.value,
      category: "Physics",
      content: "Gravity works",
    });

    const result = await repository.findById(ruleId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe("Physics");
      expect(result.data.id.value).toBe(ruleId.value);
    }
  });

  it("should list rules by project", async () => {
    const id1 = WorldRuleId.generate().value;
    const id2 = WorldRuleId.generate().value;
    vi.mocked(invoke).mockResolvedValue([
      { id: id1, project_id: projectId.value, category: "A", content: "C1" },
      { id: id2, project_id: projectId.value, category: "B", content: "C2" },
    ]);

    const result = await repository.findByProject(projectId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0].category).toBe("A");
    }
  });

  it("should delete a rule", async () => {
    const ruleId = WorldRuleId.generate();
    vi.mocked(invoke).mockResolvedValue(undefined);

    const result = await repository.delete(ruleId);

    expect(result.success).toBe(true);
    expect(invoke).toHaveBeenCalledWith("delete_world_rule", { id: ruleId.value });
  });
});
