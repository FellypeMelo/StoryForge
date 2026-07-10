import { StoryStructureRepository } from "../../domain/ports/story-structure-repository";
import { StoryStructure } from "../../domain/story-structure";
import { NarrativeFramework } from "../../domain/narrative-framework";
import { BookId } from "../../domain/value-objects/book-id";

interface StoredStructure {
  framework: string;
  beats: string[];
}

export class LocalStorageStructureRepository implements StoryStructureRepository {
  async getByBookId(bookId: BookId): Promise<StoryStructure | null> {
    const raw = localStorage.getItem(storageKey(bookId));
    if (!raw) return null;
    return parseStored(raw);
  }

  async save(bookId: BookId, structure: StoryStructure): Promise<void> {
    const data: StoredStructure = {
      framework: structure.getFramework().value,
      beats: structure.allBeats(),
    };
    localStorage.setItem(storageKey(bookId), JSON.stringify(data));
  }
}

function storageKey(bookId: BookId): string {
  return `storyforge_structure_${bookId.value}`;
}

function parseStored(raw: string): StoryStructure | null {
  try {
    const data = JSON.parse(raw) as StoredStructure;
    const framework = NarrativeFramework.fromValue(data.framework);
    if (!framework || !Array.isArray(data.beats)) return null;
    return StoryStructure.create(framework, data.beats);
  } catch {
    // Dados corrompidos não devem quebrar a página — tratados como ausentes.
    return null;
  }
}
