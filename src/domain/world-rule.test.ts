import { describe, it, expect } from "vitest";
import { WorldRule, WorldRuleSchema } from "./world-rule";
import { WorldRuleId } from "./value-objects/codex-ids";
import { ProjectId } from "./value-objects/project-id";
import { BookId } from "./value-objects/book-id";

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
    expect(rule.content).toBe("Magic costs life energy");
  });

  it("should create a WorldRule with optional bookId", () => {
    const projectId = ProjectId.generate();
    const bookId = BookId.generate();
    const rule = WorldRule.create({
      id: WorldRuleId.generate(),
      projectId,
      bookId,
      category: "Physics",
      content: "Gravity is 2x stronger",
    });

    expect(rule.bookId?.equals(bookId)).toBe(true);
  });

  it("should generate a default WorldRule", () => {
    const projectId = ProjectId.generate();
    const rule = WorldRule.generate(projectId, "Custom Category");

    expect(rule.projectId.equals(projectId)).toBe(true);
    expect(rule.category).toBe("Custom Category");
    expect(rule.content).toBe("Nova regra do mundo");
  });

  it("should use default category 'Geral' when generating", () => {
    const projectId = ProjectId.generate();
    const rule = WorldRule.generate(projectId);
    expect(rule.category).toBe("Geral");
  });

  it("should export props correctly", () => {
    const id = WorldRuleId.generate();
    const projectId = ProjectId.generate();
    const rule = WorldRule.create({
      id,
      projectId,
      category: "Test",
      content: "Test content",
      hierarchy: 5,
    });

    const props = rule.toProps();
    expect(props.id.equals(id)).toBe(true);
    expect(props.category).toBe("Test");
    expect(props.hierarchy).toBe(5);
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

  it("should fail validation for empty category", () => {
    const data = {
      id: WorldRuleId.generate().value,
      projectId: ProjectId.generate().value,
      category: "",
      content: "Valid content",
    };
    const result = WorldRuleSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
