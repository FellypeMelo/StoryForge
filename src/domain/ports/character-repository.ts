import { CharacterSheet } from "../character-sheet";
import { CharacterId } from "../value-objects/character-id";
import { ProjectId } from "../value-objects/project-id";
import { Result, DomainError } from "../result";

export interface CharacterRepository {
  save(character: CharacterSheet): Promise<Result<void, DomainError>>;
  findById(id: CharacterId): Promise<Result<CharacterSheet, DomainError>>;
  findByProject(projectId: ProjectId): Promise<Result<CharacterSheet[], DomainError>>;
  delete(id: CharacterId): Promise<Result<void, DomainError>>;
}
