import { Location } from "../location";
import { LocationId } from "../value-objects/bible-ids";
import { ProjectId } from "../value-objects/project-id";
import { Result, DomainError } from "../result";

export interface LocationRepository {
  save(location: Location): Promise<Result<void, DomainError>>;
  findById(id: LocationId): Promise<Result<Location, DomainError>>;
  findByProject(projectId: ProjectId): Promise<Result<Location[], DomainError>>;
  delete(id: LocationId): Promise<Result<void, DomainError>>;
}
