import { describe, it, expect } from "vitest";
import { Relationship, RelationshipSchema } from "./relationship";
import { RelationshipId, CharacterId } from "./value-objects/bible-ids";
import { ProjectId } from "./value-objects/project-id";

// Note: CharacterId is imported from bible-ids but also exists in character-id.ts
// I'll ensure I'm using the one from character-id.ts for consistency if possible, 
// but since I put it in bible-ids too, I'll check.
import { CharacterId as CharId } from "./value-objects/character-id";

describe("Relationship Entity", () => {
  it("should create a valid Relationship", () => {
    const id = RelationshipId.generate();
    const projectId = ProjectId.generate();
    const charA = CharId.generate();
    const charB = CharId.generate();
    
    const rel = Relationship.create({
      id,
      projectId,
      characterAId: charA,
      characterBId: charB,
      type: "Enemies",
    });

    expect(rel.id.equals(id)).toBe(true);
    expect(rel.type).toBe("Enemies");
  });

  it("should fail validation for empty type", () => {
    const data = {
      id: RelationshipId.generate().value,
      projectId: ProjectId.generate().value,
      characterAId: CharId.generate().value,
      characterBId: CharId.generate().value,
      type: "",
    };
    const result = RelationshipSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
