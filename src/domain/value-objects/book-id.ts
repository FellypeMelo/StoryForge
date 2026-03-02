import { Id, createIdSchema } from "./id";

export const BookIdSchema = createIdSchema("BookId");

export class BookId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): BookId {
    const result = BookIdSchema.safeParse(value);
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }
    return new BookId(result.data);
  }

  public static generate(): BookId {
    return new BookId(crypto.randomUUID());
  }
}
