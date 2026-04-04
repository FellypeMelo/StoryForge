/**
 * DisasterType — allowed disaster outcomes for a Scene beat.
 * Clean success is defined but rejected by SceneBeat (per Swain rules).
 */
export class DisasterType {
  private constructor(
    public readonly value: string,
    public readonly label: string,
  ) {}

  static No() { return new DisasterType("no", "Não"); }
  static NoAndWorse() { return new DisasterType("no-and-worse", "Não, e pior..."); }
  static YesBut() { return new DisasterType("yes-but", "Sim, mas..."); }
  static CleanSuccess() { return new DisasterType("clean-success", "Sucesso limpo"); }
}

/**
 * SceneBeat — the first half of Dwight Swain's Scene/Sequel pattern.
 * A Scene has Goal → Conflict → Disaster.
 * Disaster must never be a "clean success."
 */
export class SceneBeat {
  private constructor(
    public readonly goal: string,
    public readonly conflict: string,
    public readonly disaster: DisasterType,
  ) {}

  static create(
    goal: string,
    conflict: string,
    disaster: DisasterType,
  ): SceneBeat {
    if (disaster.value === "clean-success") {
      throw new Error("Clean success is not a valid disaster");
    }
    if (!goal.trim()) throw new Error("Scene goal must not be empty");
    if (!conflict.trim()) throw new Error("Conflict must not be empty");
    return new SceneBeat(goal, conflict, disaster);
  }

  isSuccess(): boolean {
    return true;
  }
}
