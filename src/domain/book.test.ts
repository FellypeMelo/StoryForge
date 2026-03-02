import { describe, it, expect } from "vitest";
import { Book, BookSchema } from "./book";
import { BookId } from "./value-objects/book-id";
import { ProjectId } from "./value-objects/project-id";

describe("Book Entity", () => {
  it("should create a valid Book with required fields", () => {
    const bookId = BookId.generate();
    const projectId = ProjectId.generate();
    const book = Book.create({
      id: bookId,
      projectId,
      title: "The First Chronicle",
    });

    expect(book.id.equals(bookId)).toBe(true);
    expect(book.projectId.equals(projectId)).toBe(true);
    expect(book.title).toBe("The First Chronicle");
    expect(book.genre).toBe("Geral");
    expect(book.status).toBe("draft");
    expect(book.orderInSeries).toBe(1);
    expect(book.synopsis).toBe("");
    expect(book.description).toBe("");
  });

  it("should create a Book with all fields", () => {
    const bookId = BookId.generate();
    const projectId = ProjectId.generate();
    const book = Book.create({
      id: bookId,
      projectId,
      title: "Dark Horizons",
      genre: "Thriller",
      synopsis: "A dark story about revenge",
      description: "Second book in the series",
      status: "in_progress",
      orderInSeries: 2,
    });

    expect(book.title).toBe("Dark Horizons");
    expect(book.genre).toBe("Thriller");
    expect(book.synopsis).toBe("A dark story about revenge");
    expect(book.description).toBe("Second book in the series");
    expect(book.status).toBe("in_progress");
    expect(book.orderInSeries).toBe(2);
  });

  it("should fail validation for empty title", () => {
    const data = {
      id: BookId.generate().value,
      projectId: ProjectId.generate().value,
      title: "",
      genre: "Fantasy",
      createdAt: new Date().toISOString(),
    };
    const result = BookSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject invalid status values", () => {
    const data = {
      id: BookId.generate().value,
      projectId: ProjectId.generate().value,
      title: "Valid Title",
      status: "invalid_status",
    };
    const result = BookSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should generate a Book with defaults via factory", () => {
    const projectId = ProjectId.generate();
    const book = Book.generate(projectId, "Quick Draft");

    expect(book.title).toBe("Quick Draft");
    expect(book.projectId.equals(projectId)).toBe(true);
    expect(book.status).toBe("draft");
    expect(book.orderInSeries).toBe(1);
  });
});
