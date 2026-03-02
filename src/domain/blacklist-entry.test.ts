import { describe, it, expect } from "vitest";
import { BlacklistEntry, BlacklistEntrySchema } from "./blacklist-entry";
import { BlacklistEntryId } from "./value-objects/codex-ids";
import { ProjectId } from "./value-objects/project-id";
import { BookId } from "./value-objects/book-id";

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
    expect(entry.toProps().category).toBe("Style");
    expect(entry.toProps().reason).toBe("Overused");
  });

  it("should support optional bookId", () => {
    const projectId = ProjectId.generate();
    const bookId = BookId.generate();
    const entry = BlacklistEntry.create({
      id: BlacklistEntryId.generate(),
      projectId,
      bookId,
      term: "Another cliché"
    });
    expect(entry.bookId?.equals(bookId)).toBe(true);
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

  it("should export props", () => {
    const entry = BlacklistEntry.create({
      id: BlacklistEntryId.generate(),
      projectId: ProjectId.generate(),
      term: "Test"
    });
    const props = entry.toProps();
    expect(props.term).toBe("Test");
  });
});
