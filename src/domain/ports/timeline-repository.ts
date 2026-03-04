import { TimelineEvent } from "../timeline-event";
import { TimelineEventId } from "../value-objects/codex-ids";
import { ProjectId } from "../value-objects/project-id";
import { Result, DomainError } from "../result";

export interface TimelineRepository {
  save(event: TimelineEvent): Promise<Result<void, DomainError>>;
  findById(id: TimelineEventId): Promise<Result<TimelineEvent, DomainError>>;
  findByProject(projectId: ProjectId): Promise<Result<TimelineEvent[], DomainError>>;
  delete(id: TimelineEventId): Promise<Result<void, DomainError>>;
}
