import { ProjectId } from "../value-objects/project-id";
import { Result, DomainError } from "../result";
import { EntityType, SearchResult } from "./search-port";

export interface VectorSearchPort {
  findSimilar(
    projectId: ProjectId,
    embedding: number[],
    topK: number,
    types?: EntityType[],
  ): Promise<Result<SearchResult[], DomainError>>;
}
