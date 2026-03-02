import { describe, it, expect } from "vitest";
import { TimelineEvent, TimelineEventSchema } from "./timeline-event";
import { TimelineEventId } from "./value-objects/codex-ids";
import { ProjectId } from "./value-objects/project-id";
import { BookId } from "./value-objects/book-id";

describe("TimelineEvent Entity", () => {
  it("should create a valid TimelineEvent", () => {
    const id = TimelineEventId.generate();
    const projectId = ProjectId.generate();
    const depId = TimelineEventId.generate();
    const event = TimelineEvent.create({
      id,
      projectId,
      date: "Year 100",
      description: "The Great War started",
      causalDependencies: [depId]
    });

    expect(event.id.equals(id)).toBe(true);
    expect(event.date).toBe("Year 100");
    expect(event.description).toBe("The Great War started");
    expect(event.toProps().causalDependencies[0].equals(depId)).toBe(true);
  });

  it("should support optional bookId", () => {
    const projectId = ProjectId.generate();
    const bookId = BookId.generate();
    const event = TimelineEvent.create({
      id: TimelineEventId.generate(),
      projectId,
      bookId,
      description: "Event in book"
    });
    expect(event.bookId?.equals(bookId)).toBe(true);
  });

  it("should fail validation for empty description", () => {
    const data = {
      id: TimelineEventId.generate().value,
      projectId: ProjectId.generate().value,
      date: "Year 100",
      description: "",
    };
    const result = TimelineEventSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should export props", () => {
    const event = TimelineEvent.create({
      id: TimelineEventId.generate(),
      projectId: ProjectId.generate(),
      description: "Test"
    });
    const props = event.toProps();
    expect(props.description).toBe("Test");
  });
});
