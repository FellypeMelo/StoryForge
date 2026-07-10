import { ChapterOutlineRepository } from "../../domain/ports/chapter-outline-repository";
import { ChapterOutline } from "../../domain/chapter-outline";
import { SceneBeat, DisasterType } from "../../domain/scene-beat";
import { SequelBeat } from "../../domain/sequel-beat";
import { Cliffhanger, CliffhangerType } from "../../domain/cliffhanger";
import { ScenePolarity } from "../../domain/scene-grid";
import { BookId } from "../../domain/value-objects/book-id";
import { ChapterId } from "../../domain/value-objects/chapter-id";

interface StoredScene {
  type: "scene";
  goal: string;
  conflict: string;
  disaster: string;
}

interface StoredSequel {
  type: "sequel";
  reaction: string;
  dilemma: string[];
  decision: string;
}

type StoredBeat = StoredScene | StoredSequel;

interface StoredOutline {
  id: string;
  chapterNumber: number;
  beats: StoredBeat[];
  cliffhanger: { type: string; description: string };
  startPolarity: "positive" | "negative";
  endPolarity: "positive" | "negative";
}

export class LocalStorageChapterRepository implements ChapterOutlineRepository {
  async getByBookId(bookId: BookId): Promise<ChapterOutline[]> {
    const raw = localStorage.getItem(storageKey(bookId));
    if (!raw) return [];
    return parseStored(raw);
  }

  async save(bookId: BookId, outlines: ChapterOutline[]): Promise<void> {
    const data = outlines.map(serializeOutline);
    localStorage.setItem(storageKey(bookId), JSON.stringify(data));
  }
}

function storageKey(bookId: BookId): string {
  return `storyforge_chapters_${bookId.value}`;
}

function parseStored(raw: string): ChapterOutline[] {
  try {
    const data = JSON.parse(raw) as StoredOutline[];
    if (!Array.isArray(data)) return [];
    return data
      .map(deserializeOutline)
      .filter((o): o is ChapterOutline => o !== null);
  } catch {
    // Dados corrompidos não devem quebrar a página — tratados como ausentes.
    return [];
  }
}

function serializeOutline(outline: ChapterOutline): StoredOutline {
  return {
    id: outline.getId().value,
    chapterNumber: outline.getChapterNumber(),
    beats: outline.getBeats().map(serializeBeat),
    cliffhanger: {
      type: outline.getCliffhanger().type.value,
      description: outline.getCliffhanger().description,
    },
    startPolarity: outline.getStartPolarity() === "+" ? "positive" : "negative",
    endPolarity: outline.getEndPolarity() === "+" ? "positive" : "negative",
  };
}

function serializeBeat(beat: SceneBeat | SequelBeat): StoredBeat {
  if (beat instanceof SceneBeat) {
    return {
      type: "scene",
      goal: beat.goal,
      conflict: beat.conflict,
      disaster: beat.disaster.value,
    };
  }
  return {
    type: "sequel",
    reaction: beat.reaction,
    dilemma: [...beat.dilemmaOptions],
    decision: beat.decision,
  };
}

function deserializeOutline(stored: StoredOutline): ChapterOutline | null {
  try {
    return ChapterOutline.create(
      ChapterId.create(stored.id),
      stored.chapterNumber,
      stored.beats.map(deserializeBeat),
      Cliffhanger.create(
        CliffhangerType.fromValue(stored.cliffhanger.type) ?? CliffhangerType.PrePoint(),
        stored.cliffhanger.description,
      ),
      ScenePolarity.create(stored.startPolarity),
      ScenePolarity.create(stored.endPolarity),
    );
  } catch {
    // Entradas que violam invariantes do domínio são descartadas individualmente.
    return null;
  }
}

function deserializeBeat(beat: StoredBeat): SceneBeat | SequelBeat {
  if (beat.type === "scene") {
    return SceneBeat.create(
      beat.goal,
      beat.conflict,
      DisasterType.fromValue(beat.disaster) ?? DisasterType.No(),
    );
  }
  return SequelBeat.create(beat.reaction, beat.dilemma, beat.decision);
}
