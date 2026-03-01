import { Id, createIdSchema } from "./id";

export const CharacterIdSchema = createIdSchema("CharacterId");

export class CharacterId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): CharacterId {
    const result = CharacterIdSchema.safeParse(value);
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }
    return new CharacterId(result.data);
  }

  public static generate(): CharacterId {
    return new CharacterId(crypto.randomUUID());
  }
}
