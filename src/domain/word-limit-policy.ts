export interface WordLimitResult {
  valid: boolean;
  message: string | null;
}

export class WordLimitPolicy {
  static readonly MIN = 500;
  static readonly MAX = 800;

  static validate(limit: number): WordLimitResult {
    if (limit < this.MIN) {
      return {
        valid: false,
        message: `Word limit ${limit} is below CAD minimum of ${this.MIN}`,
      };
    }
    if (limit > this.MAX) {
      return {
        valid: false,
        message: `Word limit ${limit} exceeds CAD maximum of ${this.MAX} per beat`,
      };
    }
    return { valid: true, message: null };
  }
}
