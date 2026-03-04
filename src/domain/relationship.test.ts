import { describe, it, expect } from "vitest";
import { Relationship, RelationshipSchema } from "./relationship";
import { RelationshipId } from "./value-objects/codex-ids";
import { CharacterId as CharId } from "./value-objects/character-id";
import { ProjectId } from "./value-objects/project-id";
import { BookId } from "./value-objects/book-id";

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
    expect(rel.toProps().characterAId.equals(charA)).toBe(true);
    expect(rel.toProps().characterBId.equals(charB)).toBe(true);
  });

  it("should support optional bookId", () => {
    const projectId = ProjectId.generate();
    const bookId = BookId.generate();
    const rel = Relationship.create({
      id: RelationshipId.generate(),
      projectId,
      bookId,
      characterAId: CharId.generate(),
      characterBId: CharId.generate(),
      type: "Friends",
    });
    expect(rel.bookId?.equals(bookId)).toBe(true);
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

  it("should export props", () => {
    const rel = Relationship.create({
      id: RelationshipId.generate(),
      projectId: ProjectId.generate(),
      characterAId: CharId.generate(),
      characterBId: CharId.generate(),
      type: "Test",
    });
    const props = rel.toProps();
    expect(props.type).toBe("Test");
  });
});
