import { Genre } from '../value-objects/genre';

export class ClicheBlacklist {
  constructor(
    public readonly genre: Genre,
    public readonly bannedTerms: string[]
  ) {
    if (!bannedTerms || bannedTerms.length === 0) {
      throw new Error('Banned terms list cannot be empty');
    }
  }
}
