import { z } from "zod";
import { TimelineEventId, TimelineEventIdSchema } from "./value-objects/bible-ids";
import { ProjectId, ProjectIdSchema } from "./value-objects/project-id";

export const TimelineEventSchema = z.object({
  id: TimelineEventIdSchema,
  projectId: ProjectIdSchema,
  date: z.string().default(""),
  description: z.string().min(1, "Description cannot be empty"),
  causalDependencies: z.array(TimelineEventIdSchema).default([]),
});

export type TimelineEventProps = z.infer<typeof TimelineEventSchema>;

export class TimelineEvent {
  private constructor(private readonly props: TimelineEventProps) {}

  public static create(props: {
    id: TimelineEventId;
    projectId: ProjectId;
    date?: string;
    description: string;
    causalDependencies?: TimelineEventId[];
  }): TimelineEvent {
    const validated = TimelineEventSchema.parse({
      id: props.id.value,
      projectId: props.projectId.value,
      date: props.date,
      description: props.description,
      causalDependencies: props.causalDependencies?.map(id => id.value),
    });

    return new TimelineEvent({
      ...validated,
      id: TimelineEventId.create(validated.id),
      projectId: ProjectId.create(validated.projectId),
      causalDependencies: validated.causalDependencies.map(id => TimelineEventId.create(id)),
    });
  }

  public get id(): TimelineEventId {
    return this.props.id as TimelineEventId;
  }

  public get description(): string {
    return this.props.description;
  }
}
