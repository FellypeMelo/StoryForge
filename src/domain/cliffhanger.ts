/**
 * Cliffhanger — tipado por tipo (Pre-point, Climatic, Post-point).
 * Must terminate every ChapterOutline.
 */
export class CliffhangerType {
  private constructor(
    public readonly value: string,
    public readonly label: string,
  ) {}

  static PrePoint() { return new CliffhangerType("pre-point", "Pre-point"); }
  static Climactic() { return new CliffhangerType("climactic", "Climático"); }
  static PostPoint() { return new CliffhangerType("post-point", "Post-point"); }
}

export class Cliffhanger {
  private constructor(
    public readonly type: CliffhangerType,
    public readonly description: string,
  ) {}

  static create(type: CliffhangerType, description: string): Cliffhanger {
    if (!description.trim()) {
      throw new Error("Cliffhanger description must not be empty");
    }
    return new Cliffhanger(type, description);
  }
}
