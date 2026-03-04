import { z } from "zod";

export const createIdSchema = (name: string) =>
  z.string().uuid(`Invalid ${name}: must be a valid UUID`);

export abstract class Id {
  protected constructor(protected readonly _value: string) {}

  public get value(): string {
    return this._value;
  }

  public equals(other: Id): boolean {
    return this._value === other.value;
  }
}
