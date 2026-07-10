export type MotifFrequencyCurve = "linear" | "escalating";

export interface MotifDefinitionProps {
  object: string;
  associatedWound: string;
  frequencyCurve: MotifFrequencyCurve;
}

export class MotifDefinition {
  private constructor(private readonly props: MotifDefinitionProps) {}

  public static create(props: MotifDefinitionProps): MotifDefinition {
    if (!props.object.trim()) {
      throw new Error("O objeto do motivo não pode estar vazio");
    }
    if (!props.associatedWound.trim()) {
      throw new Error("A ferida associada ao motivo não pode estar vazia");
    }
    return new MotifDefinition(props);
  }

  public get object(): string {
    return this.props.object;
  }

  public get associatedWound(): string {
    return this.props.associatedWound;
  }

  public get frequencyCurve(): MotifFrequencyCurve {
    return this.props.frequencyCurve;
  }

  /**
   * Intensity (0..1) at a given story progress (0..1). The escalating curve
   * is quadratic so its rate of change accelerates near progress = 1,
   * mirroring a motif tightening its grip as the confrontation approaches.
   */
  public frequencyAt(progress: number): number {
    const clamped = Math.min(1, Math.max(0, progress));
    if (this.props.frequencyCurve === "escalating") {
      return clamped * clamped;
    }
    return clamped;
  }
}
