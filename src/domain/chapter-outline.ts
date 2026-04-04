import { SceneBeat } from "./scene-beat";
import { SequelBeat } from "./sequel-beat";
import { Cliffhanger } from "./cliffhanger";
import { ScenePolarity, StoryGridValidator } from "./scene-grid";
import { ChapterId } from "./value-objects/chapter-id";

/**
 * ChapterOutline aggregate — encapsulates a chapter's beats sequence,
 * validates minimum beat count and Story Grid polarity inversion.
 */
export class ChapterOutline {
  private constructor(
    private readonly id: ChapterId,
    private readonly chapterNumber: number,
    private readonly beats: (SceneBeat | SequelBeat)[],
    private readonly cliffhanger: Cliffhanger,
    private readonly startPolarity: ScenePolarity,
    private readonly endPolarity: ScenePolarity,
    private readonly _polarityWarning: string | null,
  ) {}

  static create(
    id: ChapterId,
    chapterNumber: number,
    beats: (SceneBeat | SequelBeat)[],
    cliffhanger: Cliffhanger,
    startPolarity: ScenePolarity,
    endPolarity: ScenePolarity,
  ): ChapterOutline {
    const totalBeats = beats.length + 1; // +1 for cliffhanger

    if (totalBeats < 4) {
      throw new Error(
        `Chapter outline must have a minimum of 4 beats, got ${totalBeats}. Add more Scene/Sequel beats.`
      );
    }

    const polarityResult = StoryGridValidator.validate(startPolarity, endPolarity);
    const warning = polarityResult.valid ? null : polarityResult.message;

    return new ChapterOutline(
      id,
      chapterNumber,
      beats,
      cliffhanger,
      startPolarity,
      endPolarity,
      warning,
    );
  }

  beatCount(): number {
    return this.beats.length + 1;
  }

  hasCliffhanger(): boolean {
    return true;
  }

  hasPolarityWarning(): boolean {
    return this._polarityWarning !== null;
  }

  getPolarityWarning(): string | null {
    return this._polarityWarning;
  }

  getBeats(): (SceneBeat | SequelBeat)[] {
    return [...this.beats];
  }

  getCliffhanger(): Cliffhanger {
    return this.cliffhanger;
  }

  getChapterNumber(): number {
    return this.chapterNumber;
  }

  getId(): ChapterId {
    return this.id;
  }

  getStartPolarity(): string {
    return this.startPolarity.toString();
  }

  getEndPolarity(): string {
    return this.endPolarity.toString();
  }
}
