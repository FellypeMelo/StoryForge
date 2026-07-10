import { describe, it, expect, beforeEach } from "vitest";
import { LocalStorageChapterRepository } from "./local-storage-chapter-repository";
import { BookId } from "../../domain/value-objects/book-id";
import { ChapterId } from "../../domain/value-objects/chapter-id";
import { ChapterOutline } from "../../domain/chapter-outline";
import { SceneBeat, DisasterType } from "../../domain/scene-beat";
import { SequelBeat } from "../../domain/sequel-beat";
import { Cliffhanger, CliffhangerType } from "../../domain/cliffhanger";
import { ScenePolarity } from "../../domain/scene-grid";

function buildOutline(chapterNumber: number, goal = "Encontrar o mapa"): ChapterOutline {
  const scene1 = SceneBeat.create(goal, "A biblioteca está em chamas", DisasterType.YesBut());
  const sequel = SequelBeat.create(
    "Entra em pânico com a perda iminente",
    ["Arriscar a vida no fogo", "Perder o mapa para sempre"],
    "Decide entrar com roupas molhadas",
  );
  const scene2 = SceneBeat.create(
    "Atravessar as estantes em chamas",
    "O teto desaba bloqueando a saída",
    DisasterType.NoAndWorse(),
  );
  const cliffhanger = Cliffhanger.create(
    CliffhangerType.Climactic(),
    "Descobre que o mapa é falso",
  );
  return ChapterOutline.create(
    ChapterId.generate(),
    chapterNumber,
    [scene1, sequel, scene2],
    cliffhanger,
    ScenePolarity.create("positive"),
    ScenePolarity.create("negative"),
  );
}

describe("LocalStorageChapterRepository", () => {
  let repo: LocalStorageChapterRepository;
  let bookId: BookId;

  beforeEach(() => {
    localStorage.clear();
    repo = new LocalStorageChapterRepository();
    bookId = BookId.generate();
  });

  it("retorna lista vazia quando não há capítulos salvos", async () => {
    expect(await repo.getByBookId(bookId)).toEqual([]);
  });

  it("salva e recupera capítulos (round-trip completo)", async () => {
    const outline = buildOutline(1);
    await repo.save(bookId, [outline]);

    const loaded = await repo.getByBookId(bookId);

    expect(loaded).toHaveLength(1);
    const chapter = loaded[0];
    expect(chapter.getChapterNumber()).toBe(1);
    expect(chapter.getId().value).toBe(outline.getId().value);
    expect(chapter.getBeats()).toHaveLength(3);

    const firstBeat = chapter.getBeats()[0] as SceneBeat;
    expect(firstBeat.goal).toBe("Encontrar o mapa");
    expect(firstBeat.disaster.value).toBe("yes-but");

    const sequel = chapter.getBeats()[1] as SequelBeat;
    expect(sequel.dilemmaOptions).toHaveLength(2);
    expect(sequel.decision).toBe("Decide entrar com roupas molhadas");

    expect(chapter.getCliffhanger().description).toBe("Descobre que o mapa é falso");
    expect(chapter.getCliffhanger().type.value).toBe("climactic");
    expect(chapter.getStartPolarity()).toBe("+");
    expect(chapter.getEndPolarity()).toBe("-");
  });

  it("usa a chave storyforge_chapters_<bookId>", async () => {
    await repo.save(bookId, [buildOutline(1)]);
    expect(localStorage.getItem(`storyforge_chapters_${bookId.value}`)).not.toBeNull();
  });

  it("preserva a ordem de múltiplos capítulos", async () => {
    await repo.save(bookId, [buildOutline(1), buildOutline(2, "Confrontar o traidor")]);
    const loaded = await repo.getByBookId(bookId);
    expect(loaded.map((c) => c.getChapterNumber())).toEqual([1, 2]);
  });

  it("retorna lista vazia para JSON corrompido", async () => {
    localStorage.setItem(`storyforge_chapters_${bookId.value}`, "não é json");
    expect(await repo.getByBookId(bookId)).toEqual([]);
  });

  it("ignora entradas inválidas preservando as válidas", async () => {
    await repo.save(bookId, [buildOutline(1)]);
    const raw = JSON.parse(localStorage.getItem(`storyforge_chapters_${bookId.value}`)!);
    raw.push({ id: "não-é-uuid", chapterNumber: 2, beats: [] });
    localStorage.setItem(`storyforge_chapters_${bookId.value}`, JSON.stringify(raw));

    const loaded = await repo.getByBookId(bookId);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].getChapterNumber()).toBe(1);
  });
});
