import { Relationship } from "../relationship";
import { RelationshipId } from "../value-objects/codex-ids";
import { ProjectId } from "../value-objects/project-id";
import { Result, DomainError } from "../result";

export interface RelationshipRepository {
  save(relationship: Relationship): Promise<Result<void, DomainError>>;
  findById(id: RelationshipId): Promise<Result<Relationship, DomainError>>;
  findByProject(projectId: ProjectId): Promise<Result<Relationship[], DomainError>>;
  delete(id: RelationshipId): Promise<Result<void, DomainError>>;
}


