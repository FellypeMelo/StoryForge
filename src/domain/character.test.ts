import { describe, it, expect } from "vitest";
import { Character } from "./character";
import { CharacterId } from "./value-objects/character-id";
import { ProjectId } from "./value-objects/project-id";
import { BookId } from "./value-objects/book-id";

describe("Character Entity", () => {
  it("should create a valid Character", () => {
    const id = CharacterId.generate();
    const projectId = ProjectId.generate();
    const character = Character.create({
      id,
      projectId,
      name: "Protagonist",
      age: 25,
      occupation: "Researcher",
      goal: "Find the cure",
      internal_conflict: "Fear of failure",
      ocean_scores: {
        openness: 80,
        conscientiousness: 70,
        extraversion: 60,
        agreeableness: 90,
        neuroticism: 20,
      }
    });

    expect(character.id.equals(id)).toBe(true);
    expect(character.projectId.equals(projectId)).toBe(true);
    expect(character.name).toBe("Protagonist");
    expect(character.age).toBe(25);
    expect(character.occupation).toBe("Researcher");
    expect(character.ocean_scores.openness).toBe(80);
  });

  it("should generate a character", () => {
    const projectId = ProjectId.generate();
    const character = Character.generate(projectId, "Sidekick");
    expect(character.name).toBe("Sidekick");
    expect(character.projectId.equals(projectId)).toBe(true);
  });

  it("should support optional bookId", () => {
    const projectId = ProjectId.generate();
    const bookId = BookId.generate();
    const character = Character.generate(projectId, "Hero", bookId);
    expect(character.bookId?.equals(bookId)).toBe(true);
  });

  it("should export props", () => {
    const character = Character.generate(ProjectId.generate(), "Test");
    const props = character.toProps();
    expect(props.name).toBe("Test");
  });

  it("should generate a correct snapshot", () => {
    const character = Character.create({
      id: CharacterId.generate(),
      projectId: ProjectId.generate(),
      name: "Arthur",
      age: 30,
      occupation: "Knight",
      goal: "Protect the king",
      internal_conflict: "Secret love for the queen"
    });

    const snapshot = character.toSnapshot();
    expect(snapshot).toContain("Arthur");
    expect(snapshot).toContain("30 anos");
    expect(snapshot).toContain("Knight");
    expect(snapshot).toContain("Protect the king");
    expect(snapshot).toContain("Secret love for the queen");
  });
});
