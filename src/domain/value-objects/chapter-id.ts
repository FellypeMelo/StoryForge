import { Id, createIdSchema } from "./id";

export const ChapterIdSchema = createIdSchema("ChapterId");

export class ChapterId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): ChapterId {
    const result = ChapterIdSchema.safeParse(value);
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }
    return new ChapterId(result.data);
  }

  public static generate(): ChapterId {
    return new ChapterId(crypto.randomUUID());
  }
}
