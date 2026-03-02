import { ProjectId } from "../value-objects/project-id";
import { Result, DomainError } from "../result";

export enum EntityType {
  Character = "character",
  Location = "location",
  WorldRule = "world_rule",
  TimelineEvent = "timeline_event",
}

export interface SearchResult {
  entityId: string;
  type: EntityType;
  snippet: string;
  score: number;
}

export interface SearchPort {
  search(projectId: ProjectId, query: string, types?: EntityType[]): Promise<Result<SearchResult[], DomainError>>;
}


