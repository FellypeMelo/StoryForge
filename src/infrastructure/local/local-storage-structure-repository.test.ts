import { describe, it, expect, beforeEach } from "vitest";
import { LocalStorageStructureRepository } from "./local-storage-structure-repository";
import { BookId } from "../../domain/value-objects/book-id";
import { NarrativeFramework } from "../../domain/narrative-framework";
import { StoryStructure } from "../../domain/story-structure";

describe("LocalStorageStructureRepository", () => {
  let repo: LocalStorageStructureRepository;
  let bookId: BookId;

  beforeEach(() => {
    localStorage.clear();
    repo = new LocalStorageStructureRepository();
    bookId = BookId.generate();
  });

  it("retorna null quando não há estrutura salva para o livro", async () => {
    const result = await repo.getByBookId(bookId);
    expect(result).toBeNull();
  });

  it("salva e recupera a estrutura (round-trip)", async () => {
    const framework = NarrativeFramework.SaveTheCat();
    const structure = StoryStructure.create(framework, [
      "Abertura no porto",
      "O tema é dito pela avó",
    ]);

    await repo.save(bookId, structure);
    const loaded = await repo.getByBookId(bookId);

    expect(loaded).not.toBeNull();
    expect(loaded!.frameworkName()).toBe("Save the Cat");
    expect(loaded!.getBeat(0)).toBe("Abertura no porto");
    expect(loaded!.getBeat(1)).toBe("O tema é dito pela avó");
    expect(loaded!.beatCount()).toBe(15);
  });

  it("usa a chave storyforge_structure_<bookId>", async () => {
    const structure = StoryStructure.create(NarrativeFramework.Kishotenketsu(), []);
    await repo.save(bookId, structure);

    expect(localStorage.getItem(`storyforge_structure_${bookId.value}`)).not.toBeNull();
  });

  it("isola estruturas por livro", async () => {
    const otherBook = BookId.generate();
    await repo.save(
      bookId,
      StoryStructure.create(NarrativeFramework.Fichteana(), ["Crise inicial"]),
    );

    expect(await repo.getByBookId(otherBook)).toBeNull();
  });

  it("retorna null para JSON corrompido em vez de lançar erro", async () => {
    localStorage.setItem(`storyforge_structure_${bookId.value}`, "{corrompido!!");
    expect(await repo.getByBookId(bookId)).toBeNull();
  });

  it("retorna null para framework desconhecido", async () => {
    localStorage.setItem(
      `storyforge_structure_${bookId.value}`,
      JSON.stringify({ framework: "framework-inexistente", beats: [] }),
    );
    expect(await repo.getByBookId(bookId)).toBeNull();
  });
});
