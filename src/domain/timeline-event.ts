import { z } from "zod";
import { TimelineEventId, TimelineEventIdSchema } from "./value-objects/codex-ids";
import { ProjectId, ProjectIdSchema } from "./value-objects/project-id";
import { BookId, BookIdSchema } from "./value-objects/book-id";

export const TimelineEventSchema = z.object({
  id: TimelineEventIdSchema,
  projectId: ProjectIdSchema,
  bookId: BookIdSchema.optional(),
  date: z.string().default(""),
  description: z.string().min(1, "Description cannot be empty"),
  causalDependencies: z.array(TimelineEventIdSchema).default([]),
});

export interface TimelineEventProps {
  id: TimelineEventId;
  projectId: ProjectId;
  bookId?: BookId;
  date: string;
  description: string;
  causalDependencies: TimelineEventId[];
}

export class TimelineEvent {
  private constructor(private readonly props: TimelineEventProps) {}

  public static create(props: {
    id: TimelineEventId;
    projectId: ProjectId;
    bookId?: BookId;
    date?: string;
    description: string;
    causalDependencies?: TimelineEventId[];
  }): TimelineEvent {
    const validated = TimelineEventSchema.parse({
      id: props.id.value,
      projectId: props.projectId.value,
      bookId: props.bookId?.value,
      date: props.date,
      description: props.description,
      causalDependencies: props.causalDependencies?.map((id) => id.value),
    });

    return new TimelineEvent({
      ...validated,
      id: TimelineEventId.create(validated.id),
      projectId: ProjectId.create(validated.projectId),
      bookId: validated.bookId ? BookId.create(validated.bookId) : undefined,
      causalDependencies: validated.causalDependencies.map((id) => TimelineEventId.create(id)),
    });
  }

  public get id(): TimelineEventId {
    return this.props.id;
  }

  public get bookId(): BookId | undefined {
    return this.props.bookId;
  }

  public get date(): string {
    return this.props.date;
  }

  public toProps(): TimelineEventProps {
    return { ...this.props };
  }

  public get description(): string {
    return this.props.description;
  }
}
