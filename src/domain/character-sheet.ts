import { OceanProfile } from "./ocean-profile";
import { HaugeArc } from "./hauge-arc";
import { VoiceProfile, PhysicalTells } from "./voice-profile";

export interface CharacterSheetProps {
  ocean: OceanProfile;
  hauge?: HaugeArc;
  voice: VoiceProfile;
  tells: PhysicalTells;
}

export class CharacterSheet {
  private constructor(private readonly props: CharacterSheetProps) {}

  public static create(props: CharacterSheetProps): CharacterSheet {
    return new CharacterSheet(props);
  }

  public isComplete(): boolean {
    return !!this.props.hauge;
  }

  public get ocean(): OceanProfile {
    return this.props.ocean;
  }

  public get hauge(): HaugeArc | undefined {
    return this.props.hauge;
  }

  public get voice(): VoiceProfile {
    return this.props.voice;
  }

  public get tells(): PhysicalTells {
    return this.props.tells;
  }
}
