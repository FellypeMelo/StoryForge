export enum OceanTraitScore {
  Low = "Low",
  Medium = "Medium",
  High = "High",
}

export interface OceanProfileProps {
  openness: OceanTraitScore;
  conscientiousness: OceanTraitScore;
  extraversion: OceanTraitScore;
  agreeableness: OceanTraitScore;
  neuroticism: OceanTraitScore;
}

export class OceanProfile {
  private constructor(private readonly props: OceanProfileProps) {}

  public static create(props: OceanProfileProps): OceanProfile {
    return new OceanProfile(props);
  }

  public get openness(): OceanTraitScore {
    return this.props.openness;
  }

  public get conscientiousness(): OceanTraitScore {
    return this.props.conscientiousness;
  }

  public get extraversion(): OceanTraitScore {
    return this.props.extraversion;
  }

  public get agreeableness(): OceanTraitScore {
    return this.props.agreeableness;
  }

  public get neuroticism(): OceanTraitScore {
    return this.props.neuroticism;
  }

  public getFatalFlaw(): string {
    if (
      this.props.conscientiousness === OceanTraitScore.High &&
      this.props.neuroticism === OceanTraitScore.High
    ) {
      return "Obsessive Perfectionist";
    }

    if (
      this.props.openness === OceanTraitScore.High &&
      this.props.agreeableness === OceanTraitScore.High &&
      this.props.conscientiousness === OceanTraitScore.Low
    ) {
      return "Naive Idealist";
    }

    return "None";
  }
}
