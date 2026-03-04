import { invoke } from "@tauri-apps/api/core";
import { BlacklistRepository } from "../../domain/ports/blacklist-repository";
import { BlacklistEntry } from "../../domain/blacklist-entry";
import { Result } from "../../domain/result";
import { BlacklistEntryId } from "../../domain/value-objects/codex-ids";
import { ProjectId } from "../../domain/value-objects/project-id";

/**
 * Implementation of BlacklistRepository that uses Tauri IPC to communicate with the Rust backend.
 */
export class TauriBlacklistRepository implements BlacklistRepository {
  async save(entry: BlacklistEntry): Promise<Result<void, Error>> {
    try {
      const props = entry.toProps();
      await invoke("create_blacklist_entry", {
        projectId: props.projectId.value,
        term: props.term,
        category: props.category,
        reason: props.reason,
      });
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async findById(_id: BlacklistEntryId): Promise<Result<BlacklistEntry, Error>> {
    throw new Error("Method not implemented.");
  }

  async findByProject(_projectId: ProjectId): Promise<Result<BlacklistEntry[], Error>> {
    throw new Error("Method not implemented.");
  }

  async delete(_id: BlacklistEntryId): Promise<Result<void, Error>> {
    throw new Error("Method not implemented.");
  }
}
