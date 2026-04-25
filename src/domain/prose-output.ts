export interface ProseOutputProps {
  draft: string;
  critique: string;
  finalVersion: string;
}

export class ProseOutput {
  private constructor(
    public readonly draft: string,
    public readonly critique: string,
    public readonly finalVersion: string,
  ) {}

  static create(props: ProseOutputProps): ProseOutput {
    if (!props.draft.trim()) throw new Error("Draft must not be empty");
    if (!props.critique.trim()) throw new Error("Critique must not be empty");
    if (!props.finalVersion.trim()) throw new Error("Final version must not be empty");

    return new ProseOutput(props.draft, props.critique, props.finalVersion);
  }

  get wordCount(): number {
    return this.finalVersion.trim().split(/\s+/).filter(Boolean).length;
  }
}
