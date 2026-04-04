import { NarrativeFramework, BEATS_MAP } from "./narrative-framework";

/**
 * StoryStructure entity — represents a narrative structure instance
 * for a chosen framework, with filled beats tracked per framework template.
 */
export class StoryStructure {
  private constructor(
    private readonly framework: NarrativeFramework,
    private readonly beats: string[],
  ) {}

  static create(
    framework: NarrativeFramework,
    filledBeats: string[],
  ): StoryStructure {
    const expected = BEATS_MAP[framework.name];
    const beats = expected.map((_, i) => filledBeats[i] ?? "");
    return new StoryStructure(framework, beats);
  }

  isSuccess(): boolean {
    return this.missingBeats().length === 0;
  }

  missingBeats(): string[] {
    const labels = BEATS_MAP[this.framework.name];
    return labels
      .map((label, i) => ({ label, filled: this.beats[i] }))
      .filter(({ filled }) => !filled || filled.trim().length === 0)
      .map(({ label }) => label);
  }

  beatCount(): number {
    return this.beats.length;
  }

  frameworkName(): string {
    return this.framework.name;
  }

  getBeat(index: number): string {
    return this.beats[index] ?? "";
  }

  allBeats(): string[] {
    return [...this.beats];
  }

  getFramework(): NarrativeFramework {
    return this.framework;
  }

  beatLabels(): string[] {
    return BEATS_MAP[this.framework.name];
  }
}
