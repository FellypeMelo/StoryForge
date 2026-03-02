export class Genre {
  private constructor(public readonly value: string) {}

  static create(value: string): Genre {
    if (!value || value.trim().length === 0) {
      throw new Error('Genre cannot be empty');
    }
    if (value.trim().length < 2) {
      throw new Error('Genre must be at least 2 characters');
    }
    return new Genre(value.trim());
  }
}
