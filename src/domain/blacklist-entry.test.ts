import { describe, it, expect } from "vitest";
import { BlacklistEntry, BlacklistEntrySchema } from "./blacklist-entry";
import { BlacklistEntryId } from "./value-objects/bible-ids";
import { ProjectId } from "./value-objects/project-id";

describe("BlacklistEntry Entity", () => {
  it("should create a valid BlacklistEntry", () => {
    const id = BlacklistEntryId.generate();
    const projectId = ProjectId.generate();
    
    const entry = BlacklistEntry.create({
      id,
      projectId,
      term: "cliché",
      category: "Style",
      reason: "Overused",
    });

    expect(entry.id.equals(id)).toBe(true);
    expect(entry.term).toBe("cliché");
  });

  it("should fail validation for empty term", () => {
    const data = {
      id: BlacklistEntryId.generate().value,
      projectId: ProjectId.generate().value,
      term: "",
      category: "Style",
      reason: "Overused",
    };
    const result = BlacklistEntrySchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
