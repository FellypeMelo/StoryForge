import { invoke } from "@tauri-apps/api/core";
import { WorldRuleRepository } from "../../domain/ports/world-rule-repository";
import { WorldRule } from "../../domain/world-rule";
import { Result } from "../../domain/result";
import { WorldRuleId } from "../../domain/value-objects/codex-ids";
import { ProjectId } from "../../domain/value-objects/project-id";

/**
 * Implementation of WorldRuleRepository that uses Tauri IPC to communicate with the Rust backend.
 */
export class TauriWorldRuleRepository implements WorldRuleRepository {
  constructor(private readonly bookId: string) {}

  async save(rule: WorldRule): Promise<Result<void, Error>> {
    try {
      const props = rule.toProps();
      await invoke("create_world_rule", {
        projectId: props.projectId.value,
        bookId: this.bookId,
        category: props.category,
        content: props.content,
      });
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async findById(id: WorldRuleId): Promise<Result<WorldRule, Error>> {
    try {
      const data = await invoke<any>("get_world_rule", { id: id.value });
      if (!data) return { success: false, error: new Error("Rule not found") };
      
      return {
        success: true,
        data: WorldRule.create({
          ...data,
          id: { value: data.id },
          projectId: { value: data.project_id },
          bookId: data.book_id ? { value: data.book_id } : undefined,
        } as any)
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async findByProject(projectId: ProjectId): Promise<Result<WorldRule[], Error>> {
    try {
      const data = await invoke<any[]>("list_global_world_rules", { projectId: projectId.value });
      return {
        success: true,
        data: data.map(d => WorldRule.create({
          ...d,
          id: { value: d.id },
          projectId: { value: d.project_id },
          bookId: d.book_id ? { value: d.book_id } : undefined,
        } as any))
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async delete(id: WorldRuleId): Promise<Result<void, Error>> {
    try {
      await invoke("delete_world_rule", { id: id.value });
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}
