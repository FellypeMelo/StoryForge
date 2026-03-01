import { Character } from "../character";
import { CharacterId } from "../value-objects/character-id";
import { ProjectId } from "../value-objects/project-id";
import { Result, DomainError } from "../result";

export interface CharacterRepository {
  save(character: Character): Promise<Result<void, DomainError>>;
  findById(id: CharacterId): Promise<Result<Character, DomainError>>;
  findByProject(projectId: ProjectId): Promise<Result<Character[], DomainError>>;
  delete(id: CharacterId): Promise<Result<void, DomainError>>;
}
