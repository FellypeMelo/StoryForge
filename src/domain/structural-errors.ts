export class StructuralErrorType {
  private constructor(
    public readonly value: string,
    public readonly label: string,
  ) {}

  static SaggingMiddle() {
    return new StructuralErrorType("sagging-middle", "Sagging Middle (Miolo Frouxo)");
  }
  static EarlyResolution() {
    return new StructuralErrorType("early-resolution", "Resolução Precoce");
  }
  static Episodicity() {
    return new StructuralErrorType("episodicity", "Episodicidade");
  }
}

export interface StructuralError {
  type: StructuralErrorType;
  chapterRef: number;
  message: string;
}

export interface ChapterData {
  beats: Array<{ type: "scene" | "sequel"; summary: string }>;
  chapterNumber: number;
}

export class StructuralErrorDetector {
  static detect(chapters: ChapterData[]): StructuralError[] {
    const errors: StructuralError[] = [];
    errors.push(...this.detectSaggingMiddle(chapters));
    errors.push(...this.detectEarlyResolution(chapters));
    errors.push(...this.detectEpisodicity(chapters));
    return errors;
  }

  private static detectSaggingMiddle(chapters: ChapterData[]): StructuralError[] {
    const errors: StructuralError[] = [];
    const totalChapters = chapters.length;
    if (totalChapters < 3) return errors;

    const middleStart = Math.floor(totalChapters * 0.25);
    const middleEnd = Math.ceil(totalChapters * 0.75);

    for (let i = middleStart; i < middleEnd; i++) {
      const chapter = chapters[i];
      if (!chapter || chapter.beats.length === 0) continue;

      const sequelCount = chapter.beats.filter(
        (b) => b.type === "sequel"
      ).length;
      const totalCount = chapter.beats.length;

      // If a chapter in the middle has >70% sequels, flag it
      if (sequelCount / totalCount > 0.7) {
        errors.push({
          type: StructuralErrorType.SaggingMiddle(),
          chapterRef: chapter.chapterNumber,
          message: `Capítulo ${chapter.chapterNumber}: excesso de reflexão sem progressão. ${sequelCount}/${totalCount} beats são Sequelas sem avanço de cena.`,
        });
      }
    }

    return errors;
  }

  private static detectEarlyResolution(
    chapters: ChapterData[],
  ): StructuralError[] {
    const errors: StructuralError[] = [];
    const totalChapters = chapters.length;
    if (totalChapters < 3) return errors;

    const act3Start = Math.floor(totalChapters * 0.7);

    for (let i = 0; i < act3Start; i++) {
      const chapter = chapters[i];
      const hasResolution = chapter.beats.some((b) =>
        /surrender|surren|derrota|resolvid|vencido|celebrates|celebra|acabou|fim definitivo/i.test(
          b.summary
        )
      );
      if (hasResolution) {
        errors.push({
          type: StructuralErrorType.EarlyResolution(),
          chapterRef: chapter.chapterNumber,
          message: `Capítulo ${chapter.chapterNumber}: conflito central parece resolvido antes do Ato 3. A tensão narrativa será perdida.`,
        });
      }
    }

    return errors;
  }

  private static detectEpisodicity(
    chapters: ChapterData[],
  ): StructuralError[] {
    const errors: StructuralError[] = [];

    for (let i = 1; i < chapters.length; i++) {
      const prevSummary = chapters[i - 1].beats
        .map((b) => b.summary)
        .join(" ")
        .toLowerCase();
      const currentSummary = chapters[i].beats
        .map((b) => b.summary)
        .join(" ")
        .toLowerCase();

      const prevWords = new Set(
        prevSummary.split(/\s+/).filter((w) => w.length > 4)
      );
      const currentWords = currentSummary
        .split(/\s+/)
        .filter((w) => w.length > 4);
      const sharedWords = currentWords.filter((w) => prevWords.has(w));

      if (
        prevWords.size > 1 &&
        currentWords.length > 1 &&
        sharedWords.length === 0
      ) {
        errors.push({
          type: StructuralErrorType.Episodicity(),
          chapterRef: chapters[i].chapterNumber,
          message: `Capítulo ${chapters[i].chapterNumber}: sem conexão causal detectável com o capítulo anterior. Eventos parecem desconectados.`,
        });
      }
    }

    return errors;
  }
}
