export class Premise {
  constructor(
    public readonly protagonist: string,
    public readonly incitingIncident: string,
    public readonly antagonist: string,
    public readonly stakes: string
  ) {
    if (!antagonist || antagonist.trim().length === 0) {
      throw new Error('Antagonist cannot be empty');
    }

    if (!stakes || stakes.trim().length === 0) {
      throw new Error('Stakes cannot be empty');
    }

    if (stakes.trim().length < 15) {
      throw new Error('Stakes are too vague');
    }
  }
}
