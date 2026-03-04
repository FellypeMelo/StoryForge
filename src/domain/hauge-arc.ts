export interface HaugeArcProps {
  wound: string;
  belief: string;
  fear: string;
  identity: string;
  essence: string;
}

export class HaugeArc {
  private constructor(private readonly props: HaugeArcProps) {}

  public static create(props: HaugeArcProps): HaugeArc {
    if (props.identity.toLowerCase() === props.essence.toLowerCase()) {
      throw new Error("Identity and Essence must be in opposition");
    }
    return new HaugeArc(props);
  }

  public get wound(): string {
    return this.props.wound;
  }

  public get belief(): string {
    return this.props.belief;
  }

  public get fear(): string {
    return this.props.fear;
  }

  public get identity(): string {
    return this.props.identity;
  }

  public get essence(): string {
    return this.props.essence;
  }
}
