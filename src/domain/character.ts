import { z } from "zod";
import { CharacterId, CharacterIdSchema } from "./value-objects/character-id";
import { ProjectId, ProjectIdSchema } from "./value-objects/project-id";

export const OceanScoresSchema = z.object({
  openness: z.number().min(0).max(100).default(50),
  conscientiousness: z.number().min(0).max(100).default(50),
  extraversion: z.number().min(0).max(100).default(50),
  agreeableness: z.number().min(0).max(100).default(50),
  neuroticism: z.number().min(0).max(100).default(50),
});

export type OceanScores = z.infer<typeof OceanScoresSchema>;

export const CharacterSchema = z.object({
  id: CharacterIdSchema,
  projectId: ProjectIdSchema,
  name: z.string().min(1, "Name cannot be empty"),
  age: z.number().int().min(0).default(0),
  occupation: z.string().default(""),
  physical_description: z.string().default(""),
  goal: z.string().default(""),
  motivation: z.string().default(""),
  internal_conflict: z.string().default(""),
  ocean_scores: OceanScoresSchema.default(() => ({
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
  })),
  voice: z.string().default(""),
  mannerisms: z.string().default(""),
});

export interface CharacterProps {
  id: CharacterId;
  projectId: ProjectId;
  name: string;
  age: number;
  occupation: string;
  physical_description: string;
  goal: string;
  motivation: string;
  internal_conflict: string;
  ocean_scores: OceanScores;
  voice: string;
  mannerisms: string;
}

export class Character {
  private constructor(private readonly props: CharacterProps) {}

  public static create(props: {
    id: CharacterId;
    projectId: ProjectId;
    name: string;
    age?: number;
    occupation?: string;
    physical_description?: string;
    goal?: string;
    motivation?: string;
    internal_conflict?: string;
    ocean_scores?: OceanScores;
    voice?: string;
    mannerisms?: string;
  }): Character {
    const validated = CharacterSchema.parse({
      id: props.id.value,
      projectId: props.projectId.value,
      name: props.name,
      age: props.age,
      occupation: props.occupation,
      physical_description: props.physical_description,
      goal: props.goal,
      motivation: props.motivation,
      internal_conflict: props.internal_conflict,
      ocean_scores: props.ocean_scores,
      voice: props.voice,
      mannerisms: props.mannerisms,
    });

    return new Character({
      ...validated,
      id: CharacterId.create(validated.id),
      projectId: ProjectId.create(validated.projectId),
    });
  }

  public get id(): CharacterId {
    return this.props.id;
  }

  public toProps(): CharacterProps {
    return { ...this.props };
  }

  public get projectId(): ProjectId {
    return this.props.projectId;
  }

  public get name(): string {
    return this.props.name;
  }

  public get age(): number {
    return this.props.age;
  }

  public get occupation(): string {
    return this.props.occupation;
  }

  public get ocean_scores(): OceanScores {
    return this.props.ocean_scores;
  }
}
