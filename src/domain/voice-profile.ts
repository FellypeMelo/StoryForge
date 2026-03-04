export interface VoiceProfileProps {
  sentenceLength: string;
  formality: string;
  verbalTics: string[];
  evasionMechanism: string;
}

export class VoiceProfile {
  private constructor(private readonly props: VoiceProfileProps) {}

  public static create(props: VoiceProfileProps): VoiceProfile {
    return new VoiceProfile(props);
  }

  public get sentenceLength(): string {
    return this.props.sentenceLength;
  }

  public get formality(): string {
    return this.props.formality;
  }

  public get verbalTics(): string[] {
    return [...this.props.verbalTics];
  }

  public get evasionMechanism(): string {
    return this.props.evasionMechanism;
  }
}

export class PhysicalTells {
  private constructor(private readonly _list: string[]) {}

  public static create(list: string[]): PhysicalTells {
    if (list.length < 3) {
      throw new Error("At least 3 physical tells are required");
    }
    return new PhysicalTells(list);
  }

  public get list(): string[] {
    return [...this._list];
  }
}
