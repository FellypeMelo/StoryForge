import { describe, it, expect } from "vitest";
import { Location, LocationSchema } from "./location";
import { LocationId } from "./value-objects/bible-ids";
import { ProjectId } from "./value-objects/project-id";

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
    expect(location.name).toBe("The Dark Forest");
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
