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

  async findById(id: BlacklistEntryId): Promise<Result<BlacklistEntry, Error>> {
    try {
      const data = await invoke<any>("get_blacklist_entry", { id: id.value });
      if (!data) return { success: false, error: new Error("Entry not found") };
      
      return {
        success: true,
        data: BlacklistEntry.create({
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

  async findByProject(projectId: ProjectId): Promise<Result<BlacklistEntry[], Error>> {
    try {
      const data = await invoke<any[]>("list_global_blacklist_entries", { projectId: projectId.value });
      return {
        success: true,
        data: data.map(d => BlacklistEntry.create({
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

  async delete(id: BlacklistEntryId): Promise<Result<void, Error>> {
    try {
      await invoke("delete_blacklist_entry", { id: id.value });
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}
