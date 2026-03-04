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

  async findById(_id: WorldRuleId): Promise<Result<WorldRule, Error>> {
    throw new Error("Method not implemented.");
  }

  async findByProject(_projectId: ProjectId): Promise<Result<WorldRule[], Error>> {
    throw new Error("Method not implemented.");
  }

  async delete(_id: WorldRuleId): Promise<Result<void, Error>> {
    throw new Error("Method not implemented.");
  }
}
