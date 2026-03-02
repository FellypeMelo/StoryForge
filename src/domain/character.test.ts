import { describe, it, expect } from "vitest";
import { Character, CharacterSchema } from "./character";
import { CharacterId } from "./value-objects/character-id";
import { ProjectId } from "./value-objects/project-id";

describe("Character Entity", () => {
  it("should create a valid Character", () => {
    const id = CharacterId.generate();
    const projectId = ProjectId.generate();
    const character = Character.create({
      id,
      projectId,
      name: "Protagonist",
      age: 25,
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
    expect(character.ocean_scores.openness).toBe(80);
  });

  it("should fail validation for empty name if we make it strict (or pass if empty is allowed)", () => {
    const data = {
      id: CharacterId.generate().value,
      projectId: ProjectId.generate().value,
      name: "",
    };
    const result = CharacterSchema.safeParse(data);
    // Since name: z.string().default("") allows empty string, it should succeed.
    expect(result.success).toBe(true);
  });
});


