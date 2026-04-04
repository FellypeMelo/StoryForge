import { Id, createIdSchema } from "./id";

export const SceneIdSchema = createIdSchema("SceneId");

export class SceneId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): SceneId {
    const result = SceneIdSchema.safeParse(value);
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }
    return new SceneId(result.data);
  }

  public static generate(): SceneId {
    return new SceneId(crypto.randomUUID());
  }
}
