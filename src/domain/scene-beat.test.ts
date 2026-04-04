import { describe, it, expect } from "vitest";
import { SceneBeat, DisasterType } from "./scene-beat";

describe("DisasterType", () => {
  it("provides all 4 types", () => {
    expect(DisasterType.No().label).toBe("Não");
    expect(DisasterType.NoAndWorse().label).toBe("Não, e pior...");
    expect(DisasterType.YesBut().label).toBe("Sim, mas...");
    expect(DisasterType.CleanSuccess().label).toBe("Sucesso limpo");
  });
});

describe("SceneBeat", () => {
  it("creates with 'No' disaster", () => {
    const beat = SceneBeat.create(
      "Find the key",
      "Guard blocks the way",
      DisasterType.No(),
    );
    expect(beat.isSuccess()).toBe(true);
  });

  it("creates with 'No and worse' disaster", () => {
    const beat = SceneBeat.create(
      "Find the key",
      "Guard blocks the way",
      DisasterType.NoAndWorse(),
    );
    expect(beat.isSuccess()).toBe(true);
    expect(beat.disaster.label).toBe("Não, e pior...");
  });

  it("creates with 'Yes but' disaster", () => {
    const beat = SceneBeat.create(
      "Find the key",
      "Guard blocks the way",
      DisasterType.YesBut(),
    );
    expect(beat.isSuccess()).toBe(true);
    expect(beat.disaster.value).toBe("yes-but");
  });

  it("rejects clean success", () => {
    expect(() =>
      SceneBeat.create("Find the key", "Guard blocks the way", DisasterType.CleanSuccess())
    ).toThrow("Clean success is not a valid disaster");
  });

  it("rejects empty goal", () => {
    expect(() =>
      SceneBeat.create("", "Guard blocks the way", DisasterType.No())
    ).toThrow("Scene goal must not be empty");
  });

  it("rejects empty conflict", () => {
    expect(() =>
      SceneBeat.create("Find the key", "", DisasterType.No())
    ).toThrow("Conflict must not be empty");
  });

  it("stores props correctly", () => {
    const beat = SceneBeat.create(
      "Escape the room",
      "Door is locked",
      DisasterType.No(),
    );
    expect(beat.goal).toBe("Escape the room");
    expect(beat.conflict).toBe("Door is locked");
    expect(beat.disaster.value).toBe("no");
    expect(beat.disaster.label).toBe("Não");
  });
});
