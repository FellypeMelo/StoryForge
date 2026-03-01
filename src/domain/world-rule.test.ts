import { describe, it, expect } from "vitest";
import { WorldRule, WorldRuleSchema } from "./world-rule";
import { WorldRuleId } from "./value-objects/bible-ids";
import { ProjectId } from "./value-objects/project-id";

describe("WorldRule Entity", () => {
  it("should create a valid WorldRule", () => {
    const id = WorldRuleId.generate();
    const projectId = ProjectId.generate();
    const rule = WorldRule.create({
      id,
      projectId,
      category: "Magic",
      content: "Magic costs life energy",
      hierarchy: 1,
    });

    expect(rule.id.equals(id)).toBe(true);
    expect(rule.category).toBe("Magic");
  });

  it("should fail validation for empty content", () => {
    const data = {
      id: WorldRuleId.generate().value,
      projectId: ProjectId.generate().value,
      category: "Magic",
      content: "",
    };
    const result = WorldRuleSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
