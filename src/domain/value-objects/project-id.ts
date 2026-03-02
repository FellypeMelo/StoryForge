import { Id, createIdSchema } from "./id";

export const ProjectIdSchema = createIdSchema("ProjectId");

export class ProjectId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): ProjectId {
    const result = ProjectIdSchema.safeParse(value);
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }
    return new ProjectId(result.data);
  }

  public static generate(): ProjectId {
    return new ProjectId(crypto.randomUUID());
  }
}


