export class AcademicDiscipline {
  private constructor(public readonly value: string) {}

  static create(value: string): AcademicDiscipline {
    if (!value || value.trim().length === 0) {
      throw new Error("Academic discipline cannot be empty");
    }
    return new AcademicDiscipline(value.trim());
  }
}
