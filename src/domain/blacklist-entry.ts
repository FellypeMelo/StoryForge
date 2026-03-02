import { z } from "zod";
import { BlacklistEntryId, BlacklistEntryIdSchema } from "./value-objects/codex-ids";
import { ProjectId, ProjectIdSchema } from "./value-objects/project-id";
import { BookId, BookIdSchema } from "./value-objects/book-id";

export const BlacklistEntrySchema = z.object({
  id: BlacklistEntryIdSchema,
  projectId: ProjectIdSchema,
  bookId: BookIdSchema.optional(),
  term: z.string().min(1, "Term cannot be empty"),
  category: z.string().default("General"),
  reason: z.string().default(""),
});

export interface BlacklistEntryProps {
  id: BlacklistEntryId;
  projectId: ProjectId;
  bookId?: BookId;
  term: string;
  category: string;
  reason: string;
}

export class BlacklistEntry {
  private constructor(private readonly props: BlacklistEntryProps) {}

  public static create(props: {
    id: BlacklistEntryId;
    projectId: ProjectId;
    bookId?: BookId;
    term: string;
    category?: string;
    reason?: string;
  }): BlacklistEntry {
    const validated = BlacklistEntrySchema.parse({
      id: props.id.value,
      projectId: props.projectId.value,
      bookId: props.bookId?.value,
      term: props.term,
      category: props.category,
      reason: props.reason,
    });

    return new BlacklistEntry({
      ...validated,
      id: BlacklistEntryId.create(validated.id),
      projectId: ProjectId.create(validated.projectId),
      bookId: validated.bookId ? BookId.create(validated.bookId) : undefined,
    });
  }

  public get id(): BlacklistEntryId {
    return this.props.id;
  }

  public get bookId(): BookId | undefined {
    return this.props.bookId;
  }

  public toProps(): BlacklistEntryProps {
    return { ...this.props };
  }

  public get term(): string {
    return this.props.term;
  }
}


