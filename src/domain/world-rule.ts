import { z } from "zod";
import { WorldRuleId, WorldRuleIdSchema } from "./value-objects/bible-ids";
import { ProjectId, ProjectIdSchema } from "./value-objects/project-id";

export const WorldRuleSchema = z.object({
  id: WorldRuleIdSchema,
  projectId: ProjectIdSchema,
  category: z.string().min(1, "Category cannot be empty"),
  content: z.string().min(1, "Content cannot be empty"),
  hierarchy: z.number().int().min(0).default(0),
});

export interface WorldRuleProps {
  id: WorldRuleId;
  projectId: ProjectId;
  category: string;
  content: string;
  hierarchy: number;
}

export class WorldRule {
  private constructor(private readonly props: WorldRuleProps) {}

  public static create(props: {
    id: WorldRuleId;
    projectId: ProjectId;
    category: string;
    content: string;
    hierarchy?: number;
  }): WorldRule {
    const validated = WorldRuleSchema.parse({
      id: props.id.value,
      projectId: props.projectId.value,
      category: props.category,
      content: props.content,
      hierarchy: props.hierarchy,
    });

    return new WorldRule({
      ...validated,
      id: WorldRuleId.create(validated.id),
      projectId: ProjectId.create(validated.projectId),
    });
  }

  public get id(): WorldRuleId {
    return this.props.id;
  }

  public toProps(): WorldRuleProps {
    return { ...this.props };
  }

  public get category(): string {
    return this.props.category;
  }

  public get content(): string {
    return this.props.content;
  }
}
