import { describe, it, expect } from "vitest";
import { Location, LocationSchema } from "./location";
import { LocationId } from "./value-objects/codex-ids";
import { ProjectId } from "./value-objects/project-id";
import { BookId } from "./value-objects/book-id";

describe("Location Entity", () => {
  it("should create a valid Location", () => {
    const id = LocationId.generate();
    const projectId = ProjectId.generate();
    const location = Location.create({
      id,
      projectId,
      name: "The Dark Forest",
      description: "A scary place",
      symbolicMeaning: "The unknown",
    });

    expect(location.id.equals(id)).toBe(true);
    expect(location.projectId.equals(projectId)).toBe(true);
    expect(location.name).toBe("The Dark Forest");
    expect(location.description).toBe("A scary place");
    expect(location.symbolicMeaning).toBe("The unknown");
  });

  it("should create with optional bookId", () => {
    const projectId = ProjectId.generate();
    const bookId = BookId.generate();
    const location = Location.generate(projectId, "Castle", bookId);
    expect(location.bookId?.equals(bookId)).toBe(true);
  });

  it("should generate a location", () => {
    const projectId = ProjectId.generate();
    const location = Location.generate(projectId, "Village");
    expect(location.name).toBe("Village");
    expect(location.projectId.equals(projectId)).toBe(true);
  });

  it("should export props", () => {
    const location = Location.generate(ProjectId.generate(), "Test");
    const props = location.toProps();
    expect(props.name).toBe("Test");
  });

  it("should fail validation for empty name", () => {
    const data = {
      id: LocationId.generate().value,
      projectId: ProjectId.generate().value,
      name: "",
    };
    const result = LocationSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
