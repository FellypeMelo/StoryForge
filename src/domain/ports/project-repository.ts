import { Project } from "../project";
import { ProjectId } from "../value-objects/project-id";
import { Result, DomainError } from "../result";

export interface ProjectRepository {
  save(project: Project): Promise<Result<void, DomainError>>;
  findById(id: ProjectId): Promise<Result<Project, DomainError>>;
  findAll(): Promise<Result<Project[], DomainError>>;
  delete(id: ProjectId): Promise<Result<void, DomainError>>;
}
