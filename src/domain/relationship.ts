import { z } from "zod";
import { RelationshipId, RelationshipIdSchema } from "./value-objects/codex-ids";
import { ProjectId, ProjectIdSchema } from "./value-objects/project-id";
import { CharacterId, CharacterIdSchema } from "./value-objects/character-id";
import { BookId, BookIdSchema } from "./value-objects/book-id";

export const RelationshipSchema = z.object({
  id: RelationshipIdSchema,
  projectId: ProjectIdSchema,
  bookId: BookIdSchema.optional(),
  characterAId: CharacterIdSchema,
  characterBId: CharacterIdSchema,
  type: z.string().min(1, "Relationship type cannot be empty"),
});

export interface RelationshipProps {
  id: RelationshipId;
  projectId: ProjectId;
  bookId?: BookId;
  characterAId: CharacterId;
  characterBId: CharacterId;
  type: string;
}

export class Relationship {
  private constructor(private readonly props: RelationshipProps) {}

  public static create(props: {
    id: RelationshipId;
    projectId: ProjectId;
    bookId?: BookId;
    characterAId: CharacterId;
    characterBId: CharacterId;
    type: string;
  }): Relationship {
    const validated = RelationshipSchema.parse({
      id: props.id.value,
      projectId: props.projectId.value,
      bookId: props.bookId?.value,
      characterAId: props.characterAId.value,
      characterBId: props.characterBId.value,
      type: props.type,
    });

    return new Relationship({
      ...validated,
      id: RelationshipId.create(validated.id),
      projectId: ProjectId.create(validated.projectId),
      bookId: validated.bookId ? BookId.create(validated.bookId) : undefined,
      characterAId: CharacterId.create(validated.characterAId),
      characterBId: CharacterId.create(validated.characterBId),
    });
  }

  public get id(): RelationshipId {
    return this.props.id;
  }

  public get bookId(): BookId | undefined {
    return this.props.bookId;
  }

  public toProps(): RelationshipProps {
    return { ...this.props };
  }

  public get type(): string {
    return this.props.type;
  }
}
