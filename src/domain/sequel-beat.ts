/**
 * SequelBeat — the second half of Dwight Swain's Scene/Sequel pattern.
 * A Sequel has Reaction → Dilemma → Decision.
 * The dilemma must contain only bad/heavy-cost options.
 */
export class SequelBeat {
  private constructor(
    public readonly reaction: string,
    public readonly dilemmaOptions: string[],
    public readonly decision: string,
  ) {}

  static create(
    reaction: string,
    dilemmaOptions: string[],
    decision: string,
  ): SequelBeat {
    if (!reaction.trim()) {
      throw new Error("Reaction must not be empty");
    }
    if (dilemmaOptions.length < 2) {
      throw new Error("Dilemma must have at least 2 options");
    }

    // Domain rule: all options should be bad or carry heavy cost
    const negativeMarkers = [
      "trair", "sacrif", "perd", "desist", "culpa", "rejeit",
      "ruim", "difícil", "imposs", "pior", "arrisc", "carreg",
      "sofr", "lose", "betray", "die", "fail", "risk", "worst",
      "terrible", "sacrifice", "abandon", "impossible",
    ];

    const hasBadOptions = dilemmaOptions.every((opt) => {
      const lower = opt.toLowerCase();
      return negativeMarkers.some((m) => lower.includes(m));
    });

    if (!hasBadOptions) {
      throw new Error(
        "All options in the dilemma must be bad or carry heavy cost"
      );
    }

    if (!decision.trim()) {
      throw new Error("Decision must not be empty");
    }

    return new SequelBeat(reaction, dilemmaOptions, decision);
  }

  isSuccess(): boolean {
    return true;
  }
}
