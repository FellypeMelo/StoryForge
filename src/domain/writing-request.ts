import { PointOfView } from "./value-objects/point-of-view";
import { SceneId } from "./value-objects/scene-id";
import { WordLimitPolicy } from "./word-limit-policy";

export interface WritingRequestProps {
  sceneId: SceneId;
  beatSummary: string;
  pov: PointOfView;
  characterName: string;
  wordLimit: number;
  emotionalIntensity?: "low" | "medium" | "high";
  ragContext?: string;
}

export class WritingRequest {
  private constructor(private readonly props: WritingRequestProps) {}

  static create(props: WritingRequestProps): WritingRequest {
    if (!props.beatSummary.trim()) {
      throw new Error("Beat summary must not be empty");
    }
    if (!props.characterName.trim()) {
      throw new Error("Character name must not be empty");
    }

    const limitCheck = WordLimitPolicy.validate(props.wordLimit);
    if (!limitCheck.valid) {
      throw new Error(limitCheck.message!);
    }

    return new WritingRequest({
      emotionalIntensity: "medium",
      ...props,
    });
  }

  get sceneId(): SceneId { return this.props.sceneId; }
  get beatSummary(): string { return this.props.beatSummary; }
  get pov(): PointOfView { return this.props.pov; }
  get characterName(): string { return this.props.characterName; }
  get wordLimit(): number { return this.props.wordLimit; }
  get emotionalIntensity(): "low" | "medium" | "high" { return this.props.emotionalIntensity!; }
  get ragContext(): string | undefined { return this.props.ragContext; }
}
