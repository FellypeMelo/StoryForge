import { z } from "zod";
import { LocationId, LocationIdSchema } from "./value-objects/codex-ids";
import { ProjectId, ProjectIdSchema } from "./value-objects/project-id";
import { BookId, BookIdSchema } from "./value-objects/book-id";

export const LocationSchema = z.object({
  id: LocationIdSchema,
  projectId: ProjectIdSchema,
  bookId: BookIdSchema.optional(),
  name: z.string().min(1, "O nome da localização é obrigatório"),
  description: z.string().default(""),
  symbolicMeaning: z.string().default(""),
});

export interface LocationProps {
  id: LocationId;
  projectId: ProjectId;
  bookId?: BookId;
  name: string;
  description: string;
  symbolicMeaning: string;
}

export class Location {
  private constructor(private readonly props: LocationProps) {}

  public static create(props: {
    id: LocationId;
    projectId: ProjectId;
    bookId?: BookId;
    name: string;
    description?: string;
    symbolicMeaning?: string;
  }): Location {
    const validated = LocationSchema.parse({
      id: props.id.value,
      projectId: props.projectId.value,
      bookId: props.bookId?.value,
      name: props.name,
      description: props.description,
      symbolicMeaning: props.symbolicMeaning,
    });

    return new Location({
      ...validated,
      id: LocationId.create(validated.id),
      projectId: ProjectId.create(validated.projectId),
      bookId: validated.bookId ? BookId.create(validated.bookId) : undefined,
    });
  }

  public static generate(projectId: ProjectId, name: string, bookId?: BookId): Location {
    return Location.create({
      id: LocationId.generate(),
      projectId,
      bookId,
      name,
    });
  }

  public get id(): LocationId {
    return this.props.id;
  }

  public toProps(): LocationProps {
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

  public get description(): string {
    return this.props.description;
  }

  public get symbolicMeaning(): string {
    return this.props.symbolicMeaning;
  }
}
