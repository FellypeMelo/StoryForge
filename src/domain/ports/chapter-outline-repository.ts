import { ChapterOutline } from "../chapter-outline";
import { BookId } from "../value-objects/book-id";

export interface ChapterOutlineRepository {
  getByBookId(bookId: BookId): Promise<ChapterOutline[]>;
  save(bookId: BookId, outlines: ChapterOutline[]): Promise<void>;
}
