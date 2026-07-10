import { StoryStructure } from "../story-structure";
import { BookId } from "../value-objects/book-id";

export interface StoryStructureRepository {
  getByBookId(bookId: BookId): Promise<StoryStructure | null>;
  save(bookId: BookId, structure: StoryStructure): Promise<void>;
}
