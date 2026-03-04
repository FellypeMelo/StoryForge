import { BlacklistEntry } from "../blacklist-entry";
import { BlacklistEntryId } from "../value-objects/codex-ids";
import { ProjectId } from "../value-objects/project-id";
import { Result, DomainError } from "../result";

export interface BlacklistRepository {
  save(entry: BlacklistEntry): Promise<Result<void, DomainError>>;
  findById(id: BlacklistEntryId): Promise<Result<BlacklistEntry, DomainError>>;
  findByProject(projectId: ProjectId): Promise<Result<BlacklistEntry[], DomainError>>;
  delete(id: BlacklistEntryId): Promise<Result<void, DomainError>>;
}
