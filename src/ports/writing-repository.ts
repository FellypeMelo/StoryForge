import { ChapterOutline } from "../domain/chapter-outline";
import { Result, DomainError } from "../domain/result";
import { ChapterId } from "../domain/value-objects/chapter-id";

export interface SavedChapter {
  id: string;
  chapterId: string;
  content: string;
  lastModified: Date;
  wordCount: number;
}

export interface BeatContext {
  chapterNumber: number;
  beatType: "scene" | "sequel";
  summary: string;
  pov: "first-person" | "third-limited" | "third-omniscient";
  characterName: string;
  emotionalIntensity: "low" | "medium" | "high";
}

export interface WritingRepository {
  saveChapter(content: string, chapterId: ChapterId): Promise<Result<void, DomainError>>;
  getChapter(chapterId: ChapterId): Promise<Result<string, DomainError>>;
  getChapterOutline(chapterNumber: number): Promise<Result<ChapterOutline | null, DomainError>>;
  getAllOutlines(): Promise<Result<ChapterOutline[], DomainError>>;
  getBeatContext(chapterNumber: number): Promise<Result<BeatContext[], DomainError>>;
}
