import { z } from "zod";
import { RelationshipId, RelationshipIdSchema } from "./value-objects/bible-ids";
import { ProjectId, ProjectIdSchema } from "./value-objects/project-id";
import { CharacterId, CharacterIdSchema } from "./value-objects/character-id";

export const RelationshipSchema = z.object({
  id: RelationshipIdSchema,
  projectId: ProjectIdSchema,
  characterAId: CharacterIdSchema,
  characterBId: CharacterIdSchema,
  type: z.string().min(1, "Relationship type cannot be empty"),
});

export interface RelationshipProps {
  id: RelationshipId;
  projectId: ProjectId;
  characterAId: CharacterId;
  characterBId: CharacterId;
  type: string;
}

export class Relationship {
  private constructor(private readonly props: RelationshipProps) {}

  public static create(props: {
    id: RelationshipId;
    projectId: ProjectId;
    characterAId: CharacterId;
    characterBId: CharacterId;
    type: string;
  }): Relationship {
    const validated = RelationshipSchema.parse({
      id: props.id.value,
      projectId: props.projectId.value,
      characterAId: props.characterAId.value,
      characterBId: props.characterBId.value,
      type: props.type,
    });

    return new Relationship({
      ...validated,
      id: RelationshipId.create(validated.id),
      projectId: ProjectId.create(validated.projectId),
      characterAId: CharacterId.create(validated.characterAId),
      characterBId: CharacterId.create(validated.characterBId),
    });
  }

  public get id(): RelationshipId {
    return this.props.id;
  }

  public toProps(): RelationshipProps {
    return { ...this.props };
  }

  public get type(): string {
    return this.props.type;
  }
}
