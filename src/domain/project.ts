import { z } from "zod";
import { ProjectId, ProjectIdSchema } from "./value-objects/project-id";

export const ProjectSchema = z.object({
  id: ProjectIdSchema,
  name: z.string().min(1, "Name cannot be empty"),
  description: z.string().default(""),
  createdAt: z.date().or(z.string().pipe(z.coerce.date())),
});

export interface ProjectProps {
  id: ProjectId;
  name: string;
  description: string;
  createdAt: Date;
}

export class Project {
  private constructor(private readonly props: ProjectProps) {}

  public static create(props: {
    id: ProjectId;
    name: string;
    description?: string;
    createdAt?: Date;
  }): Project {
    const validated = ProjectSchema.parse({
      id: props.id.value,
      name: props.name,
      description: props.description,
      createdAt: props.createdAt || new Date(),
    });

    return new Project({
      id: ProjectId.create(validated.id),
      name: validated.name,
      description: validated.description,
      createdAt: validated.createdAt as Date,
    });
  }

  public get id(): ProjectId {
    return this.props.id;
  }

  public toProps(): ProjectProps {
    return { ...this.props };
  }

  public get name(): string {
    return this.props.name;
  }

  public get description(): string {
    return this.props.description;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }
}


