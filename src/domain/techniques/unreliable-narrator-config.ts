export interface UnreliableNarratorConfigProps {
  highNeuroticism: boolean;
  dissonance: boolean;
  selfPerception: string;
}

export class UnreliableNarratorConfig {
  private constructor(private readonly props: UnreliableNarratorConfigProps) {}

  public static create(props: UnreliableNarratorConfigProps): UnreliableNarratorConfig {
    if (!props.selfPerception.trim()) {
      throw new Error("A autopercepção do narrador não pode estar vazia");
    }
    return new UnreliableNarratorConfig(props);
  }

  public get highNeuroticism(): boolean {
    return this.props.highNeuroticism;
  }

  public get dissonance(): boolean {
    return this.props.dissonance;
  }

  public get selfPerception(): string {
    return this.props.selfPerception;
  }

  /**
   * The technique only activates when both the psychological driver
   * (high neuroticism) and the actual narrative dissonance are present —
   * either alone is not enough to sustain a believable unreliable narrator.
   */
  public isActive(): boolean {
    return this.props.highNeuroticism && this.props.dissonance;
  }
}
