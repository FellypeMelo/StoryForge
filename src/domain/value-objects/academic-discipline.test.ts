import { describe, it, expect } from "vitest";
import { AcademicDiscipline } from "./academic-discipline";

describe("AcademicDiscipline Value Object", () => {
  it("should create a valid discipline", () => {
    const discipline = AcademicDiscipline.create("Physics");
    expect(discipline.value).toBe("Physics");
  });

  it("should trim whitespace from discipline name", () => {
    const discipline = AcademicDiscipline.create("  Biology  ");
    expect(discipline.value).toBe("Biology");
  });

  it("should throw error if discipline is empty", () => {
    expect(() => AcademicDiscipline.create("")).toThrow("Academic discipline cannot be empty");
  });

  it("should throw error if discipline is only whitespace", () => {
    expect(() => AcademicDiscipline.create("   ")).toThrow("Academic discipline cannot be empty");
  });

  it("should throw error if value is null or undefined", () => {
    expect(() => AcademicDiscipline.create(null as any)).toThrow(
      "Academic discipline cannot be empty",
    );
    expect(() => AcademicDiscipline.create(undefined as any)).toThrow(
      "Academic discipline cannot be empty",
    );
  });
});
