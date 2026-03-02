import { Book } from "../book";
import { BookId } from "../value-objects/book-id";
import { ProjectId } from "../value-objects/project-id";
import { Result, DomainError } from "../result";

export interface BookRepository {
  save(book: Book): Promise<Result<void, DomainError>>;
  findById(id: BookId): Promise<Result<Book, DomainError>>;
  findByProjectId(projectId: ProjectId): Promise<Result<Book[], DomainError>>;
  delete(id: BookId): Promise<Result<void, DomainError>>;
}
