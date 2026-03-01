import { z } from "zod";
import { ProjectId, ProjectIdSchema } from "./value-objects/project-id";

export const ProjectSchema = z.object({
  id: ProjectIdSchema,
  title: z.string().min(1, "Title cannot be empty"),
  genre: z.string().default("General"),
  createdAt: z.date().or(z.string().pipe(z.coerce.date())),
});

export interface ProjectProps {
  id: ProjectId;
  title: string;
  genre: string;
  createdAt: Date;
}

export class Project {
  private constructor(private readonly props: ProjectProps) {}

  public static create(props: {
    id: ProjectId;
    title: string;
    genre?: string;
    createdAt?: Date;
  }): Project {
    const validated = ProjectSchema.parse({
      id: props.id.value,
      title: props.title,
      genre: props.genre,
      createdAt: props.createdAt || new Date(),
    });

    return new Project({
      id: ProjectId.create(validated.id),
      title: validated.title,
      genre: validated.genre,
      createdAt: validated.createdAt as Date,
    });
  }

  public get id(): ProjectId {
    return this.props.id;
  }

  public toProps(): ProjectProps {
    return { ...this.props };
  }

  public get title(): string {
    return this.props.title;
  }

  public get genre(): string {
    return this.props.genre;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }
}
