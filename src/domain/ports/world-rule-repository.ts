import { WorldRule } from "../world-rule";
import { WorldRuleId } from "../value-objects/codex-ids";
import { ProjectId } from "../value-objects/project-id";
import { Result, DomainError } from "../result";

export interface WorldRuleRepository {
  save(rule: WorldRule): Promise<Result<void, DomainError>>;
  findById(id: WorldRuleId): Promise<Result<WorldRule, DomainError>>;
  findByProject(projectId: ProjectId): Promise<Result<WorldRule[], DomainError>>;
  delete(id: WorldRuleId): Promise<Result<void, DomainError>>;
}


