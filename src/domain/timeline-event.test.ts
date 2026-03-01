import { describe, it, expect } from "vitest";
import { TimelineEvent, TimelineEventSchema } from "./timeline-event";
import { TimelineEventId } from "./value-objects/bible-ids";
import { ProjectId } from "./value-objects/project-id";

describe("TimelineEvent Entity", () => {
  it("should create a valid TimelineEvent", () => {
    const id = TimelineEventId.generate();
    const projectId = ProjectId.generate();
    const event = TimelineEvent.create({
      id,
      projectId,
      date: "Year 100",
      description: "The Great War started",
    });

    expect(event.id.equals(id)).toBe(true);
    expect(event.description).toBe("The Great War started");
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
});
