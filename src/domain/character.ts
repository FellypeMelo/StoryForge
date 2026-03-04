import { z } from "zod";
import { CharacterId, CharacterIdSchema } from "./value-objects/character-id";
import { ProjectId, ProjectIdSchema } from "./value-objects/project-id";
import { BookId, BookIdSchema } from "./value-objects/book-id";

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
  bookId: BookIdSchema.optional(),
  name: z.string().default(""),
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
  hauge_wound: z.string().default(""),
  hauge_belief: z.string().default(""),
  hauge_fear: z.string().default(""),
  hauge_identity: z.string().default(""),
  hauge_essence: z.string().default(""),
  voice_sentence_length: z.string().default(""),
  voice_formality: z.string().default(""),
  voice_verbal_tics: z.string().default("[]"),
  voice_evasion_mechanism: z.string().default(""),
  physical_tells: z.string().default("[\"\", \"\", \"\"]").refine((val) => {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) && parsed.length >= 3;
    } catch {
      return false;
    }
  }, { message: "At least 3 physical tells are required" }),
});

export interface CharacterProps {
  id: CharacterId;
  projectId: ProjectId;
  bookId?: BookId;
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
  hauge_wound: string;
  hauge_belief: string;
  hauge_fear: string;
  hauge_identity: string;
  hauge_essence: string;
  voice_sentence_length: string;
  voice_formality: string;
  voice_verbal_tics: string;
  voice_evasion_mechanism: string;
  physical_tells: string;
}

export class Character {
  private constructor(private readonly props: CharacterProps) {}

  public static generate(projectId: ProjectId, name: string, bookId?: BookId): Character {
    return Character.create({
      id: CharacterId.generate(),
      projectId,
      bookId,
      name,
    });
  }

  public static create(props: {
    id: CharacterId;
    projectId: ProjectId;
    bookId?: BookId;
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
    hauge_wound?: string;
    hauge_belief?: string;
    hauge_fear?: string;
    hauge_identity?: string;
    hauge_essence?: string;
    voice_sentence_length?: string;
    voice_formality?: string;
    voice_verbal_tics?: string;
    voice_evasion_mechanism?: string;
    physical_tells?: string;
  }): Character {
    const validated = CharacterSchema.parse({
      id: props.id.value,
      projectId: props.projectId.value,
      bookId: props.bookId?.value,
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
      hauge_wound: props.hauge_wound,
      hauge_belief: props.hauge_belief,
      hauge_fear: props.hauge_fear,
      hauge_identity: props.hauge_identity,
      hauge_essence: props.hauge_essence,
      voice_sentence_length: props.voice_sentence_length,
      voice_formality: props.voice_formality,
      voice_verbal_tics: props.voice_verbal_tics,
      voice_evasion_mechanism: props.voice_evasion_mechanism,
      physical_tells: props.physical_tells,
    });

    return new Character({
      ...validated,
      id: CharacterId.create(validated.id),
      projectId: ProjectId.create(validated.projectId),
      bookId: validated.bookId ? BookId.create(validated.bookId) : undefined,
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

  public get bookId(): BookId | undefined {
    return this.props.bookId;
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

  public get hauge_wound(): string {
    return this.props.hauge_wound;
  }

  public get verbal_tics(): string[] {
    try {
      return JSON.parse(this.props.voice_verbal_tics || "[]");
    } catch {
      return [];
    }
  }

  public get physical_tells_list(): string[] {
    try {
      return JSON.parse(this.props.physical_tells || "[\"\", \"\", \"\"]");
    } catch {
      return ["", "", ""];
    }
  }

  public isComplete(): boolean {
    // A character is complete if it has Hauge Arc data and deep voice profile
    return (
      !!this.props.hauge_identity &&
      !!this.props.voice_sentence_length &&
      JSON.parse(this.props.physical_tells || "[]").length >= 3
    );
  }

  public toSnapshot(): string {
    return `${this.name}, ${this.age} anos. ${this.props.occupation}. Objetivos: ${this.props.goal}. Conflito: ${this.props.internal_conflict}.`;
  }
}
