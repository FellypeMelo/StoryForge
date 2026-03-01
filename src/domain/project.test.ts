import { describe, it, expect } from "vitest";
import { Project, ProjectSchema } from "./project";
import { ProjectId } from "./value-objects/project-id";

describe("Project Entity", () => {
  it("should create a valid Project", () => {
    const id = ProjectId.generate();
    const project = Project.create({
      id,
      title: "My Epic Story",
      genre: "Fantasy",
      createdAt: new Date(),
    });

    expect(project.id.equals(id)).toBe(true);
    expect(project.title).toBe("My Epic Story");
  });

  it("should fail validation for empty title", () => {
    const data = {
      id: ProjectId.generate().value,
      title: "",
      genre: "Fantasy",
      createdAt: new Date().toISOString(),
    };
    const result = ProjectSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
