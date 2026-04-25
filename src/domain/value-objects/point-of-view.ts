const POV_TYPES = {
  "first-person": { label: "Primeira Pessoa", pronoun: "Eu" },
  "third-limited": { label: "Terceira Pessoa Limitada", pronoun: "Ele/Ela" },
  "third-omniscient": { label: "Terceira Pessoa Onisciente", pronoun: "Onisciente" },
} as const;

type PovValue = keyof typeof POV_TYPES;

export class PointOfView {
  private constructor(
    public readonly value: PovValue,
    public readonly label: string,
    private readonly pronoun: string,
  ) {}

  static create(value: PovValue): PointOfView {
    if (!POV_TYPES[value]) {
      throw new Error(`Invalid POV: ${value}`);
    }
    const config = POV_TYPES[value];
    return new PointOfView(value, config.label, config.pronoun);
  }

  toString(): string {
    return this.pronoun;
  }
}
