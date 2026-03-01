import { z } from "zod";
import { BlacklistEntryId, BlacklistEntryIdSchema } from "./value-objects/bible-ids";
import { ProjectId, ProjectIdSchema } from "./value-objects/project-id";

export const BlacklistEntrySchema = z.object({
  id: BlacklistEntryIdSchema,
  projectId: ProjectIdSchema,
  term: z.string().min(1, "Term cannot be empty"),
  category: z.string().default("General"),
  reason: z.string().default(""),
});

export type BlacklistEntryProps = z.infer<typeof BlacklistEntrySchema>;

export class BlacklistEntry {
  private constructor(private readonly props: BlacklistEntryProps) {}

  public static create(props: {
    id: BlacklistEntryId;
    projectId: ProjectId;
    term: string;
    category?: string;
    reason?: string;
  }): BlacklistEntry {
    const validated = BlacklistEntrySchema.parse({
      id: props.id.value,
      projectId: props.projectId.value,
      term: props.term,
      category: props.category,
      reason: props.reason,
    });

    return new BlacklistEntry({
      ...validated,
      id: BlacklistEntryId.create(validated.id),
      projectId: ProjectId.create(validated.projectId),
    });
  }

  public get id(): BlacklistEntryId {
    return this.props.id as BlacklistEntryId;
  }

  public get term(): string {
    return this.props.term;
  }
}
