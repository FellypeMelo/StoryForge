import { describe, it, expect } from "vitest";
import { Project, ProjectSchema } from "./project";
import { ProjectId } from "./value-objects/project-id";

describe("Project Entity", () => {
  it("should create a valid Project", () => {
    const id = ProjectId.generate();
    const project = Project.create({
      id,
      name: "My Epic Universe",
      description: "A sprawling fantasy world",
      createdAt: new Date(),
    });

    expect(project.id.equals(id)).toBe(true);
    expect(project.name).toBe("My Epic Universe");
    expect(project.description).toBe("A sprawling fantasy world");
  });

  it("should create a Project with default description", () => {
    const id = ProjectId.generate();
    const project = Project.create({
      id,
      name: "Minimal Project",
    });

    expect(project.name).toBe("Minimal Project");
    expect(project.description).toBe("");
  });

  it("should fail validation for empty name", () => {
    const data = {
      id: ProjectId.generate().value,
      name: "",
      description: "Some description",
      createdAt: new Date().toISOString(),
    };
    const result = ProjectSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
