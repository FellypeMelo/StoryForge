export class CrossPollinationSeed {
  constructor(
    public readonly genre: string,
    public readonly academicDiscipline: string
  ) {
    if (!academicDiscipline || academicDiscipline.trim().length === 0) {
      throw new Error('Academic discipline cannot be empty');
    }
  }
}
