/**
 * ScenePolarity value object — represents the emotional valence (+/-) at
 * the start or end of a scene, per Story Grid rules.
 */
export class ScenePolarity {
  private constructor(public readonly value: "positive" | "negative") {}

  static create(value: "positive" | "negative"): ScenePolarity {
    if (value !== "positive" && value !== "negative") {
      throw new Error("Polarity must be 'positive' or 'negative'");
    }
    return new ScenePolarity(value);
  }

  toString(): string {
    return this.value === "positive" ? "+" : "-";
  }

  equals(other: ScenePolarity): boolean {
    return this.value === other.value;
  }
}

/**
 * StoryGridValidator — validates that every scene flips its polarity.
 * A scene that starts positive must end negative, and vice versa.
 */
export class StoryGridValidator {
  static validate(
    start: ScenePolarity,
    end: ScenePolarity,
  ): { valid: boolean; message: string } {
    if (start.equals(end)) {
      return {
        valid: false,
        message: `Cena inútil: polaridade não muda de ${start.toString()} para ${end.toString()}. Toda cena precisa inverter a valência emocional.`,
      };
    }
    return { valid: true, message: "" };
  }
}
