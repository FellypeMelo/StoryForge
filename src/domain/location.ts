import { z } from "zod";
import { LocationId, LocationIdSchema } from "./value-objects/bible-ids";
import { ProjectId, ProjectIdSchema } from "./value-objects/project-id";

export const LocationSchema = z.object({
  id: LocationIdSchema,
  projectId: ProjectIdSchema,
  name: z.string().min(1, "Name cannot be empty"),
  description: z.string().default(""),
  symbolicMeaning: z.string().default(""),
});

export interface LocationProps {
  id: LocationId;
  projectId: ProjectId;
  name: string;
  description: string;
  symbolicMeaning: string;
}

export class Location {
  private constructor(private readonly props: LocationProps) {}

  public static create(props: {
    id: LocationId;
    projectId: ProjectId;
    name: string;
    description?: string;
    symbolicMeaning?: string;
  }): Location {
    const validated = LocationSchema.parse({
      id: props.id.value,
      projectId: props.projectId.value,
      name: props.name,
      description: props.description,
      symbolicMeaning: props.symbolicMeaning,
    });

    return new Location({
      ...validated,
      id: LocationId.create(validated.id),
      projectId: ProjectId.create(validated.projectId),
    });
  }

  public static generate(projectId: ProjectId, name: string): Location {
    return new Location({
      id: LocationId.generate(),
      projectId,
      name,
      description: "",
      symbolicMeaning: "",
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
