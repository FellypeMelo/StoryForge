# Milestone 4 — Narrative Structure & Chapter Architect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 6 narrative frameworks, Story Grid validation, Dwight Swain Scene/Sequel beats, beat sheet generator, structural error detection, and the UI pages `/structure` and `/chapters`.

**Architecture:** Domain entities in `src/domain/` follow the established pattern (zod validation + factory methods + `toProps()`). Use cases in `src/application/` depend on `LlmPort` (DIP). UI in `src/ui/components/`. Clean Architecture rules: domain never imports from infrastructure.

**Tech Stack:** TypeScript, Zod v4, React + Tailwind CSS, Vitest (TDD), Tauri IPC (backend commands later — not part of this milestone's domain work).

**Context for the Engineer:** This is the StoryForge project — a Tauri (Rust + React) offline-first literary development platform. The domain uses `Result<T, DomainError>` for error handling, zod schemas for validation, and private constructors with static factory methods (see `src/domain/character.ts` as the pattern). Tests are colocated `*.test.ts` and run via `npm run test`. The mock database (`src/test/mock-db.ts`) simulates Tauri backend in-memory. The `LlmPort` interface is in `src/domain/ideation/ports/llm-port.ts` and currently only has `DummyLlmPort` in `src/infrastructure/llm/dummy-llm-port.ts`.

---

## File Map

### New Files — Domain (Milestone 4)

| File | Responsibility |
|------|---------------|
| `src/domain/narrative-framework.ts` | `NarrativeFramework` enum/value object with 6 variants |
| `src/domain/story-structure.ts` | `StoryStructure` entity: beats per framework, validation |
| `src/domain/scene-grid.ts` | `ScenePolarity` value object, `StoryGridValidator` domain service |
| `src/domain/scene-beat.ts` | `SceneBeat` entity (Goal, Conflict, Disaster types) |
| `src/domain/sequel-beat.ts` | `SequelBeat` entity (Reaction, Dilemma, Decision) |
| `src/domain/cliffhanger.ts` | `Cliffhanger` entity (PrePoint, Climactic, PostPoint) |
| `src/domain/chapter-outline.ts` | `ChapterOutline` aggregate: sequence of beats, validation |
| `src/domain/structural-errors.ts` | `StructuralErrorDetector` with 3 heuristic detectors |
| `src/domain/value-objects/scene-id.ts` | Strongly typed `SceneId` |
| `src/domain/value-objects/chapter-id.ts` | Strongly typed `ChapterId` |

### New Files — Application (Milestone 4)

| File | Responsibility |
|------|---------------|
| `src/application/structure/generate-beat-sheet.ts` | `GenerateBeatSheetUseCase` — LLM-driven beat generation |
| `src/application/structure/detect-structural-errors.ts` | `DetectStructuralErrorsUseCase` — orchestrate detectors |

### New Files — Tests

| File | Tests |
|------|-------|
| `src/domain/narrative-framework.test.ts` | Framework enum, beat definitions |
| `src/domain/story-structure.test.ts` | `StoryStructure` creation, beat validation per framework |
| `src/domain/scene-grid.test.ts` | `ScenePolarity` inversion rule |
| `src/domain/scene-beat.test.ts` | `SceneBeat` creation, Disaster validation |
| `src/domain/sequel-beat.test.ts` | `SequelBeat` creation, Dilemma validation |
| `src/domain/cliffhanger.test.ts` | `Cliffhanger` creation & types |
| `src/domain/chapter-outline.test.ts` | `ChapterOutline` assembly & validation |
| `src/domain/structural-errors.test.ts` | 3 structural error detectors |
| `src/domain/value-objects/scene-id.test.ts` | SceneId creation/generation |
| `src/domain/value-objects/chapter-id.test.ts` | ChapterId creation/generation |
| `src/application/structure/generate-beat-sheet.test.ts` | `GenerateBeatSheetUseCase` with mock LLM |

### New Files — UI

| File | Responsibility |
|------|---------------|
| `src/ui/components/structure/structure-page.tsx` | `/structure` — framework selector + beat visualization |
| `src/ui/components/chapters/chapters-page.tsx` | `/chapters` — chapter listing + beat sheet view |

---

## Task 1: Value Objects — SceneId & ChapterId

**Files:**
- Create: `src/domain/value-objects/scene-id.ts`
- Create: `src/domain/value-objects/scene-id.test.ts`
- Create: `src/domain/value-objects/chapter-id.ts`
- Create: `src/domain/value-objects/chapter-id.test.ts`

- [ ] **Step 1: Write SceneId test**

```typescript
// src/domain/value-objects/scene-id.test.ts
import { describe, it, expect } from "vitest";
import { SceneId } from "./scene-id";

describe("SceneId", () => {
  it("creates a valid SceneId from a UUID string", () => {
    const uuid = crypto.randomUUID();
    const id = SceneId.create(uuid);
    expect(id).toBeInstanceOf(SceneId);
    expect(id.value).toBe(uuid);
  });

  it("generates a unique SceneId", () => {
    const id1 = SceneId.generate();
    const id2 = SceneId.generate();
    expect(id1.value).not.toBe(id2.value);
  });

  it("rejects an invalid UUID", () => {
    expect(() => SceneId.create("not-a-uuid")).toThrow();
  });
});
```

- [ ] **Step 2: Write SceneId implementation** (follows existing pattern in `src/domain/value-objects/character-id.ts`)

```typescript
// src/domain/value-objects/scene-id.ts
import { Id, createIdSchema } from "./id";

export const SceneIdSchema = createIdSchema("SceneId");

export class SceneId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): SceneId {
    const result = SceneIdSchema.safeParse(value);
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }
    return new SceneId(result.data);
  }

  public static generate(): SceneId {
    return new SceneId(crypto.randomUUID());
  }
}
```

- [ ] **Step 3: Write ChapterId test** (same structure, just swap SceneId → ChapterId)

```typescript
// src/domain/value-objects/chapter-id.test.ts
import { describe, it, expect } from "vitest";
import { ChapterId } from "./chapter-id";

describe("ChapterId", () => {
  it("creates a valid ChapterId from a UUID string", () => {
    const uuid = crypto.randomUUID();
    const id = ChapterId.create(uuid);
    expect(id).toBeInstanceOf(ChapterId);
    expect(id.value).toBe(uuid);
  });

  it("generates a unique ChapterId", () => {
    const id1 = ChapterId.generate();
    const id2 = ChapterId.generate();
    expect(id1.value).not.toBe(id2.value);
  });

  it("rejects an invalid UUID", () => {
    expect(() => ChapterId.create("not-a-uuid")).toThrow();
  });
});
```

- [ ] **Step 4: Write ChapterId implementation** (same pattern as SceneId, just `ChapterId`)

```typescript
// src/domain/value-objects/chapter-id.ts
import { Id, createIdSchema } from "./id";

export const ChapterIdSchema = createIdSchema("ChapterId");

export class ChapterId extends Id {
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): ChapterId {
    const result = ChapterIdSchema.safeParse(value);
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }
    return new ChapterId(result.data);
  }

  public static generate(): ChapterId {
    return new ChapterId(crypto.randomUUID());
  }
}
```

- [ ] **Step 5: Run tests and verify all pass**

Command: `npm run test -- --run src/domain/value-objects/scene-id.test.ts src/domain/value-objects/chapter-id.test.ts`

- [ ] **Step 6: Commit**

```bash
git add src/domain/value-objects/scene-id.ts src/domain/value-objects/scene-id.test.ts src/domain/value-objects/chapter-id.ts src/domain/value-objects/chapter-id.test.ts
git commit -m "feat(domain): add SceneId and ChapterId value objects for M4"
```

---

## Task 2: NarrativeFramework Enum & StoryStructure Entity

**Files:**
- Create: `src/domain/narrative-framework.ts`
- Create: `src/domain/narrative-framework.test.ts`
- Create: `src/domain/story-structure.ts`
- Create: `src/domain/story-structure.test.ts`

- [ ] **Step 1: Write NarrativeFramework test**

```typescript
// src/domain/narrative-framework.test.ts
import { describe, it, expect } from "vitest";
import { NarrativeFramework, BEATS_MAP } from "./narrative-framework";

describe("NarrativeFramework", () => {
  it("defines exactly 6 frameworks", () => {
    const values = NarrativeFramework.all();
    expect(values).toHaveLength(6);
  });

  it("has all expected framework names", () => {
    const names = NarrativeFramework.all().map((f) => f.name);
    expect(names).toContain("Jornada do Heroi");
    expect(names).toContain("Save the Cat");
    expect(names).toContain("Curva Fichteana");
    expect(names).toContain("Estrutura de 7 Pontos");
    expect(names).toContain("Kishotenketsu");
    expect(names).toContain("Não-linear");
  });

  it("Hero's Journey has 12 stages", () => {
    const fw = NarrativeFramework.HerosJourney();
    const beats = BEATS_MAP[fw.name];
    expect(beats).toHaveLength(12);
  });

  it("Save the Cat has 15 beats", () => {
    const fw = NarrativeFramework.SaveTheCat();
    const beats = BEATS_MAP[fw.name);
    expect(beats).toHaveLength(15);
  });

  it("Kishotenketsu has 4 acts", () => {
    const fw = NarrativeFramework.Kishotenketsu();
    const beats = BEATS_MAP[fw.name];
    expect(beats).toHaveLength(4);
  });

  it("Fichteana has 8 crises", () => {
    const fw = NarrativeFramework.Fichteana();
    const beats = BEATS_MAP[fw.name];
    expect(beats).toHaveLength(8);
  });

  it("7-Point Structure has 7 points", () => {
    const fw = NarrativeFramework.SevenPoint();
    const beats = BEATS_MAP[fw.name];
    expect(beats).toHaveLength(7);
  });

  it("NonLinear has 6 temporal markers", () => {
    const fw = NarrativeFramework.NonLinear();
    const beats = BEATS_MAP[fw.name];
    expect(beats).toHaveLength(6);
  });
});
```

- [ ] **Step 2: Write NarrativeFramework implementation**

```typescript
// src/domain/narrative-framework.ts
export class NarrativeFramework {
  private constructor(
    public readonly value: string,
    public readonly name: string,
  ) {}

  static HeroesJourney() { return new NarrativeFramework("heroes-journey", "Jornada do Heroi"); }
  static SaveTheCat() { return new NarrativeFramework("save-the-cat", "Save the Cat"); }
  static Fichteana() { return new NarrativeFramework("fichteana", "Curva Fichteana"); }
  static SevenPoint() { return new NarrativeFramework("seven-point", "Estrutura de 7 Pontos"); }
  static Kishotenketsu() { return new NarrativeFramework("kishotenketsu", "Kishotenketsu"); }
  static NonLinear() { return new NarrativeFramework("non-linear", "Não-linear"); }

  static all(): NarrativeFramework[] {
    return [
      this.HeroesJourney(),
      this.SaveTheCat(),
      this.Fichteana(),
      this.SevenPoint(),
      this.Kishotenketsu(),
      this.NonLinear(),
    ];
  }

  static fromValue(value: string): NarrativeFramework | null {
    return this.all().find((f) => f.value === value) ?? null;
  }
}

export const BEATS_MAP: Record<string, string[]> = {
  // 1. Hero's Journey — 12 stages
  "Jornada do Heroi": [
    "Mundo Comum",
    "Chamado à Aventura",
    "Recusa do Chamado",
    "Encontro com o Mentor",
    "Travessia do Primeiro Limiar",
    "Testes, Aliados e Inimigos",
    "Aproximação da Caverna Oculta",
    "Provação Suprema (Ordeal)",
    "Recompensa",
    "O Caminho de Volta",
    "Ressurreição",
    "Retorno com o Elixir",
  ],
  // 2. Save the Cat — 15 beats
  "Save the Cat": [
    "Imagem de Abertura",
    "Tema Enunciado",
    "Setup",
    "Catalisador",
    "Debate",
    "Entrada no Ato 2",
    "B Story (Relacionamentos)",
    "Diversão e Jogos",
    "Ponto Central",
    "Forças Internas se Aproximam",
    "Tudo Está Perdido",
    "Noite Escura da Alma",
    "Entrada no Ato 3",
    "Finale",
    "Imagem Final",
  ],
  // 3. Fichte Curve — 8 crises
  "Curva Fichteana": [
    "Crise 1: Introdução do Conflito",
    "Crise 2: Primeiro Obstáculo Real",
    "Crise 3: Escalada de Tensão",
    "Crise 4: Ponto Sem Retorno",
    "Crise 5: O Golpe Mais Forte",
    "Crise 6: Desmoronamento",
    "Crise 7: Última Tentativa",
    "Crise 8: Resolução Final",
  ],
  // 4. Seven Point Structure
  "Estrutura de 7 Pontos": [
    "Gancho (Hook)",
    "Virada Plot 1",
    "Pinch Point 1",
    "Midpoint",
    "Pinch Point 2",
    "Virada Plot 2",
    "Resolução",
  ],
  // 5. Kishōtenketsu — 4 acts
  "Kishotenketsu": [
    "Ki (Introdução)",
    "Shō (Desenvolvimento)",
    "Ten (Twist/Surpresa)",
    "Ketsu (Conclusão/Reconciliação)",
  ],
  // 6. Non-linear — 6 temporal markers
  "Não-linear": [
    "Marcador Temporal Inicial",
    "Flashback / Origem",
    "Salto ao Presente",
    "Ponto de Convergência",
    "Flashforward / Consequência Futura",
    "Reconciliação Temporal",
  ],
};
```

- [ ] **Step 3: Run tests, commit if passing**

Command: `npm run test -- --run src/domain/narrative-framework.test.ts`

- [ ] **Step 4: Write StoryStructure test**

```typescript
// src/domain/story-structure.test.ts
import { describe, it, expect } from "vitest";
import { StoryStructure } from "./story-structure";
import { NarrativeFramework } from "./narrative-framework";

describe("StoryStructure", () => {
  it("creates with all beats filled", () => {
    const structure = StoryStructure.create(
      NarrativeFramework.Kishotenketsu(),
      ["Intro", "Desenvolvimento", "Twist", "Conclusão"],
    );
    expect(structure.isSuccess()).toBe(true);
    expect(structure.missingBeats()).toHaveLength(0);
  });

  it("allows partial creation with missing beats", () => {
    const structure = StoryStructure.create(
      NarrativeFramework.Kishotenketsu(),
      ["Intro", "", "Twist", "Conclusão"],
    );
    expect(structure.isSuccess()).toBe(false);
    expect(structure.missingBeats()).toContain("Shō (Desenvolvimento)");
  });

  it("rejects fewer beats than required for complete structure", () => {
    const structure = StoryStructure.create(
      NarrativeFramework.Kishotenketsu(),
      ["Intro", "Desenvolvimento"],
    );
    expect(structure.missingBeats()).toHaveLength(2);
  });

  it("returns beat count matching framework", () => {
    const structure = StoryStructure.create(
      NarrativeFramework.HeroesJourney(),
      Array(12).fill("filled"),
    );
    expect(structure.beatCount()).toBe(12);
  });

  it("returns framework metadata", () => {
    const structure = StoryStructure.create(
      NarrativeFramework.SaveTheCat(),
      Array(15).fill("filled"),
    );
    expect(structure.frameworkName()).toBe("Save the Cat");
  });
});
```

- [ ] **Step 5: Write StoryStructure implementation**

```typescript
// src/domain/story-structure.ts
import { Result, DomainError } from "./result";
import { NarrativeFramework, BEATS_MAP } from "./narrative-framework";

export class StoryStructure {
  private constructor(
    private readonly framework: NarrativeFramework,
    private readonly beats: string[],
  ) {}

  static create(
    framework: NarrativeFramework,
    filledBeats: string[],
  ): StoryStructure {
    const expected = BEATS_MAP[framework.name];
    const beats = expected.map((label, i) => filledBeats[i] ?? "");
    return new StoryStructure(framework, beats);
  }

  isSuccess(): boolean {
    return this.missingBeats().length === 0;
  }

  missingBeats(): string[] {
    const expected = BEATS_MAP[this.framework.name];
    return expected
      .filter((_, i) => !this.beats[i] || this.beats[i].trim().length === 0)
      .map((_, i) => BEATS_MAP[this.framework.name][i]);
  }

  beatCount(): number {
    return this.beats.length;
  }

  frameworkName(): string {
    return this.framework.name;
  }

  getBeat(index: number): string {
    return this.beats[index] ?? "";
  }

  allBeats(): string[] {
    return [...this.beats];
  }

  beatLabels(): string[] {
    return BEATS_MAP[this.framework.name];
  }
}
```

- [ ] **Step 6: Run tests, commit if passing**

Command: `npm run test -- --run src/domain/story-structure.test.ts`

```bash
git add src/domain/narrative-framework.ts src/domain/narrative-framework.test.ts src/domain/story-structure.ts src/domain/story-structure.test.ts
git commit -m "feat(domain): add NarrativeFramework and StoryStructure entities (M4.1)"
```

---

## Task 3: ScenePolarity & StoryGridValidator

**Files:**
- Create: `src/domain/scene-grid.ts`
- Create: `src/domain/scene-grid.test.ts`

- [ ] **Step 1: Write test**

```typescript
// src/domain/scene-grid.test.ts
import { describe, it, expect } from "vitest";
import { ScenePolarity, StoryGridValidator } from "./scene-grid";

describe("ScenePolarity", () => {
  it("creates valid positive polarity", () => {
    const p = ScenePolarity.create("positive");
    expect(p.isSuccess()).toBe(true);
    expect(p.toString()).toBe("+");
  });

  it("creates valid negative polarity", () => {
    const p = ScenePolarity.create("negative");
    expect(p.isSuccess()).toBe(true);
    expect(p.toString()).toBe("-");
  });

  it("rejects invalid polarity", () => {
    expect(() => ScenePolarity.create("neutral" as any)).toThrow();
  });
});

describe("StoryGridValidator", () => {
  it("passes when polarity changes from + to -", () => {
    const start = ScenePolarity.create("positive");
    const end = ScenePolarity.create("negative");
    const result = StoryGridValidator.validate(start, end);
    expect(result.valid).toBe(true);
    expect(result.message).toBe("");
  });

  it("passes when polarity changes from - to +", () => {
    const start = ScenePolarity.create("negative");
    const end = ScenePolarity.create("positive");
    const result = StoryGridValidator.validate(start, end);
    expect(result.valid).toBe(true);
  });

  it("rejects when polarity stays + to +", () => {
    const start = ScenePolarity.create("positive");
    const end = ScenePolarity.create("positive");
    const result = StoryGridValidator.validate(start, end);
    expect(result.valid).toBe(false);
    expect(result.message).toContain("inútil");
  });

  it("rejects when polarity stays - to -", () => {
    const start = ScenePolarity.create("negative");
    const end = ScenePolarity.create("negative");
    const result = StoryGridValidator.validate(start, end);
    expect(result.valid).toBe(false);
    expect(result.message).toContain("inútil");
  });
});
```

- [ ] **Step 2: Write implementation**

```typescript
// src/domain/scene-grid.ts
export class ScenePolarity {
  private constructor(private readonly value: "positive" | "negative") {}

  static create(value: "positive" | "negative"): ScenePolarity {
    if (value !== "positive" && value !== "negative") {
      throw new Error("Polarity must be 'positive' or 'negative'");
    }
    return new ScenePolarity(value);
  }

  isSuccess(): boolean {
    return true;
  }

  toString(): string {
    return this.value === "positive" ? "+" : "-";
  }

  equals(other: ScenePolarity): boolean {
    return this.value === other.value;
  }
}

export class StoryGridValidator {
  static validate(
    start: ScenePolarity,
    end: ScenePolarity,
  ): { valid: boolean; message: string } {
    if (start.equals(end)) {
      return {
        valid: false,
        message: `Cena inútil: polaridade não muda de ${start.toString()} para ${end.toString()}. Toda cena precisa inverter a valência emocional.`,
      };
    }
    return { valid: true, message: "" };
  }
}
```

- [ ] **Step 3: Run tests, commit**

Command: `npm run test -- --run src/domain/scene-grid.test.ts`

```bash
git add src/domain/scene-grid.ts src/domain/scene-grid.test.ts
git commit -m "feat(domain): add ScenePolarity and StoryGridValidator (M4.2)"
```

---

## Task 4: SceneBeat & SequelBeat (Dwight Swain Pattern)

**Files:**
- Create: `src/domain/scene-beat.ts`
- Create: `src/domain/scene-beat.test.ts`
- Create: `src/domain/sequel-beat.ts`
- Create: `src/domain/sequel-beat.test.ts`

- [ ] **Step 1: Write SceneBeat test**

```typescript
// src/domain/scene-beat.test.ts
import { describe, it, expect } from "vitest";
import { SceneBeat, DisasterType } from "./scene-beat";

describe("DisasterType", () => {
  it("allows 'No' (direct failure)", () => {
    const beat = SceneBeat.create("Find the key", "Guard blocks the way", DisasterType.No());
    expect(beat.isSuccess()).toBe(true);
  });

  it("allows 'No, and worse...' (failure + complication)", () => {
    const beat = SceneBeat.create("Find the key", "Guard blocks the way", DisasterType.NoAndWorse());
    expect(beat.isSuccess()).toBe(true);
  });

  it("allows 'Yes, but...' (success with grave cost)", () => {
    const beat = SceneBeat.create("Find the key", "Guard blocks the way", DisasterType.YesBut());
    expect(beat.isSuccess()).toBe(true);
  });

  it("rejects clean success", () => {
    expect(() => SceneBeat.create("Find the key", "Guard blocks the way", DisasterType.CleanSuccess())).toThrow(
      "Clean success is not a valid disaster"
    );
  });
});

describe("SceneBeat", () => {
  it("stores goal, conflict, and disaster", () => {
    const beat = SceneBeat.create("Escape the room", "Door is locked", DisasterType.No());
    expect(beat.goal).toBe("Escape the room");
    expect(beat.conflict).toBe("Door is locked");
    expect(beat.disaster.label).toBe("Não");
  });
});
```

- [ ] **Step 2: Write SceneBeat implementation**

```typescript
// src/domain/scene-beat.ts
export class DisasterType {
  private constructor(
    public readonly value: string,
    public readonly label: string,
  ) {}

  static No() { return new DisasterType("no", "Não"); }
  static NoAndWorse() { return new DisasterType("no-and-worse", "Não, e pior..."); }
  static YesBut() { return new DisasterType("yes-but", "Sim, mas..."); }
  static CleanSuccess() { return new DisasterType("clean-success", "Sucesso limpo"); }
}

export class SceneBeat {
  private constructor(
    public readonly goal: string,
    public readonly conflict: string,
    public readonly disaster: DisasterType,
  ) {}

  static create(
    goal: string,
    conflict: string,
    disaster: DisasterType,
  ): SceneBeat {
    if (disaster.value === "clean-success") {
      throw new Error("Clean success is not a valid disaster");
    }
    if (!goal.trim()) throw new Error("Scene goal must not be empty");
    if (!conflict.trim()) throw new Error("Conflict must not be empty");
    return new SceneBeat(goal, conflict, disaster);
  }

  isSuccess(): boolean {
    return true;
  }
}
```

- [ ] **Step 3: Run SceneBeat tests, commit**

Command: `npm run test -- --run src/domain/scene-beat.test.ts`

- [ ] **Step 4: Write SequelBeat test**

```typescript
// src/domain/sequel-beat.test.ts
import { describe, it, expect } from "vitest";
import { SequelBeat } from "./sequel-beat";

describe("SequelBeat", () => {
  it("creates a valid sequel beat", () => {
    const beat = SequelBeat.create(
      "Felt devastated",
      ["Accept the loss", "Seek revenge", "Give up"],
      "Decides to investigate"
    );
    expect(beat.isSuccess()).toBe(true);
  });

  it("rejects dilemma with all good options", () => {
    expect(() =>
      SequelBeat.create(
        "Felt happy",
        ["Win lottery", "Go on vacation", "Get promoted"],
        "Decides to celebrate"
      )
    ).toThrow("All options in the dilemma must be bad or carry heavy cost");
  });

  it("accepts dilemma where all options are bad", () => {
    const beat = SequelBeat.create(
      "Felt trapped",
      ["Betray my friend", "Lose my reputation", "Sacrifice my safety"],
      "Decides to take the blame"
    );
    expect(beat.isSuccess()).toBe(true);
  });

  it("rejects empty reaction", () => {
    expect(() => SequelBeat.create("", ["bad option"], "decision")).toThrow(
      "Reaction must not be empty"
    );
  });

  it("rejects empty dilemma", () => {
    expect(() => SequelBeat.create("sad", [], "decision")).toThrow(
      "Dilemma must have at least 2 options"
    );
  });
});
```

- [ ] **Step 5: Write SequelBeat implementation**

```typescript
// src/domain/sequel-beat.ts
export class SequelBeat {
  private constructor(
    public readonly reaction: string,
    public readonly dilemmaOptions: string[],
    public readonly decision: string,
  ) {}

  static create(
    reaction: string,
    dilemmaOptions: string[],
    decision: string,
  ): SequelBeat {
    if (!reaction.trim()) {
      throw new Error("Reaction must not be empty");
    }
    if (dilemmaOptions.length < 2) {
      throw new Error("Dilemma must have at least 2 options");
    }

    // Heuristic check: options should contain negative/costly language
    // This is a domain rule — not a regex-based hard blocker, but we validate the structure
    const hasBadOptions = dilemmaOptions.every((opt) => {
      const negativeMarkers = [
        "betray", "sacrifice", "lose", "give up", "blame", "reject",
        "trair", "sacrif", "perd", "desist", "culpa", "rejeit", "ruim",
        "difícil", "imposs", "pior", "arrisc", "carreg", "sofr",
      ];
      const lower = opt.toLowerCase();
      return negativeMarkers.some((m) => lower.includes(m));
    });

    if (!hasBadOptions) {
      throw new Error("All options in the dilemma must be bad or carry heavy cost");
    }

    if (!decision.trim()) {
      throw new Error("Decision must not be empty");
    }

    return new SequelBeat(reaction, dilemmaOptions, decision);
  }

  isSuccess(): boolean {
    return true;
  }
}
```

- [ ] **Step 6: Run SequelBeat tests**

Command: `npm run test -- --run src/domain/sequel-beat.test.ts`

```bash
git add src/domain/scene-beat.ts src/domain/scene-beat.test.ts src/domain/sequel-beat.ts src/domain/sequel-beat.test.ts
git commit -m "feat(domain): add SceneBeat and SequelBeat with Swain validations (M4.3)"
```

---

## Task 5: Cliffhanger & ChapterOutline Aggregate

**Files:**
- Create: `src/domain/cliffhanger.ts`
- Create: `src/domain/cliffhanger.test.ts`
- Create: `src/domain/chapter-outline.ts`
- Create: `src/domain/chapter-outline.test.ts`

- [ ] **Step 1: Write Cliffhanger test**

```typescript
// src/domain/cliffhanger.test.ts
import { describe, it, expect } from "vitest";
import { Cliffhanger, CliffhangerType } from "./cliffhanger";

describe("Cliffhanger", () => {
  it("creates a Pre-point cliffhanger", () => {
    const ch = Cliffhanger.create(CliffhangerType.PrePoint(), "To be continued...");
    expect(ch.type.label).toBe("Pre-point");
  });

  it("creates a Climactic cliffhanger", () => {
    const ch = Cliffhanger.create(CliffhangerType.Climactic(), "The truth explodes");
    expect(ch.type.label).toBe("Climático");
  });

  it("creates a Post-point cliffhanger", () => {
    const ch = Cliffhanger.create(CliffhangerType.PostPoint(), "Aftermath reveal");
    expect(ch.type.label).toBe("Post-point");
  });

  it("rejects empty description", () => {
    expect(() => Cliffhanger.create(CliffhangerType.PrePoint(), "")).toThrow(
      "Cliffhanger description must not be empty"
    );
  });
});
```

- [ ] **Step 2: Write Cliffhanger implementation**

```typescript
// src/domain/cliffhanger.ts
export class CliffhangerType {
  private constructor(
    public readonly value: string,
    public readonly label: string,
  ) {}

  static PrePoint() { return new CliffhangerType("pre-point", "Pre-point"); }
  static Climactic() { return new CliffhangerType("climactic", "Climático"); }
  static PostPoint() { return new CliffhangerType("post-point", "Post-point"); }
}

export class Cliffhanger {
  private constructor(
    public readonly type: CliffhangerType,
    public readonly description: string,
  ) {}

  static create(type: CliffhangerType, description: string): Cliffhanger {
    if (!description.trim()) {
      throw new Error("Cliffhanger description must not be empty");
    }
    return new Cliffhanger(type, description);
  }
}
```

- [ ] **Step 3: Run Cliffhanger tests**

Command: `npm run test -- --run src/domain/cliffhanger.test.ts`

- [ ] **Step 4: Write ChapterOutline test**

```typescript
// src/domain/chapter-outline.test.ts
import { describe, it, expect } from "vitest";
import { ChapterOutline } from "./chapter-outline";
import { SceneBeat, DisasterType } from "./scene-beat";
import { SequelBeat } from "./sequel-beat";
import { Cliffhanger, CliffhangerType } from "./cliffhanger";
import { ChapterId } from "./value-objects/chapter-id";
import { ScenePolarity, StoryGridValidator } from "./scene-grid";

describe("ChapterOutline", () => {
  it("assembles a valid outline with 4+ beats", () => {
    const scene = SceneBeat.create("Find evidence", "Witness refuses to talk", DisasterType.No());
    const sequel = SequelBeat.create(
      "Frustrated",
      ["Drop the case (abandon client)", "Threaten witness (lose license)", "Find other evidence (nearly impossible)"],
      "Decides to find other evidence"
    );
    const cliff = Cliffhanger.create(CliffhangerType.PrePoint(), "Discovers someone is watching");

    const outline = ChapterOutline.create(
      ChapterId.generate(),
      1,
      [scene, sequel],
      cliff,
      ScenePolarity.create("positive"),
      ScenePolarity.create("negative"),
    );

    expect(outline.isSuccess()).toBe(true);
    expect(outline.beatCount()).toBe(3); // scene + sequel + cliffhanger
    expect(outline.hasCliffhanger()).toBe(true);
  });

  it("rejects outline with fewer than 4 beats total", () => {
    const scene = SceneBeat.create("Open door", "Locked", DisasterType.No());
    const cliff = Cliffhanger.create(CliffhangerType.PrePoint(), "Someone screams outside");

    // Only 2 beats (scene + cliffhanger), needs 4+
    expect(() =>
      ChapterOutline.create(
        ChapterId.generate(),
        1,
        [scene],
        cliff,
        ScenePolarity.create("positive"),
        ScenePolarity.create("negative"),
      )
    ).toThrow("minimum of 4 beats");
  });

  it("validates Story Grid polarity inversion", () => {
    const scene = SceneBeat.create("A", "B", DisasterType.No());
    const sequel = SequelBeat.create(
      "R",
      ["Option A (bad)", "Option B (worse)", "Option C (tragic)"],
      "D"
    );
    const cliff = Cliffhanger.create(CliffhangerType.PrePoint(), "C");

    // Same start/end polarity — should still create but flag as warning
    const outline = ChapterOutline.create(
      ChapterId.generate(),
      1,
      [scene, sequel],
      cliff,
      ScenePolarity.create("positive"),
      ScenePolarity.create("positive"),
    );

    expect(outline.hasPolarityWarning()).toBe(true);
  });
});
```

- [ ] **Step 5: Write ChapterOutline implementation**

```typescript
// src/domain/chapter-outline.ts
import { SceneBeat } from "./scene-beat";
import { SequelBeat } from "./sequel-beat";
import { Cliffhanger } from "./cliffhanger";
import { ScenePolarity, StoryGridValidator } from "./scene-grid";
import { ChapterId } from "./value-objects/chapter-id";

export class ChapterOutline {
  private constructor(
    private readonly id: ChapterId,
    private readonly chapterNumber: number,
    private readonly beats: (SceneBeat | SequelBeat)[],
    private readonly cliffhanger: Cliffhanger,
    private readonly startPolarity: ScenePolarity,
    private readonly endPolarity: ScenePolarity,
    private readonly _polarityWarning: string | null,
  ) {}

  static create(
    id: ChapterId,
    chapterNumber: number,
    beats: (SceneBeat | SequelBeat)[],
    cliffhanger: Cliffhanger,
    startPolarity: ScenePolarity,
    endPolarity: ScenePolarity,
  ): ChapterOutline {
    const totalBeats = beats.length + 1; // +1 for cliffhanger

    if (totalBeats < 4) {
      throw new Error(
        `Chapter outline must have a minimum of 4 beats, got ${totalBeats}. Add more Scene/Sequel beats.`
      );
    }

    const polarityResult = StoryGridValidator.validate(startPolarity, endPolarity);
    const warning = polarityResult.valid ? null : polarityResult.message;

    return new ChapterOutline(
      id,
      chapterNumber,
      beats,
      cliffhanger,
      startPolarity,
      endPolarity,
      warning,
    );
  }

  isSuccess(): boolean {
    return true;
  }

  beatCount(): number {
    return this.beats.length + 1;
  }

  hasCliffhanger(): boolean {
    return true;
  }

  hasPolarityWarning(): boolean {
    return this._polarityWarning !== null;
  }

  getPolarityWarning(): string | null {
    return this._polarityWarning;
  }

  getBeats(): (SceneBeat | SequelBeat)[] {
    return [...this.beats];
  }

  getCliffhanger(): Cliffhanger {
    return this.cliffhanger;
  }

  getChapterNumber(): number {
    return this.chapterNumber;
  }

  getId(): ChapterId {
    return this.id;
  }
}
```

- [ ] **Step 6: Run tests, commit**

Command: `npm run test -- --run src/domain/cliffhanger.test.ts src/domain/chapter-outline.test.ts`

```bash
git add src/domain/cliffhanger.ts src/domain/cliffhanger.test.ts src/domain/chapter-outline.ts src/domain/chapter-outline.test.ts
git commit -m "feat(domain): add Cliffhanger and ChapterOutline aggregate (M4.3)"
```

---

## Task 6: StructuralErrorDetector

**Files:**
- Create: `src/domain/structural-errors.ts`
- Create: `src/domain/structural-errors.test.ts`

- [ ] **Step 1: Write test**

```typescript
// src/domain/structural-errors.test.ts
import { describe, it, expect } from "vitest";
import {
  StructuralErrorDetector,
  StructuralErrorType,
  ChapterData,
} from "./structural-errors";

describe("StructuralErrorDetector", () => {
  describe("Sagging Middle", () => {
    it("detects sagging middle — reflections without progression", () => {
      const chapters: ChapterData[] = [
        { beats: [
            { type: "scene" as const, summary: "Fights villain" },
            { type: "sequel" as const, summary: "Plans next move" },
          ], chapterNumber: 1 },
        { beats: [
            { type: "sequel" as const, summary: "Thinks about life" },
            { type: "sequel" as const, summary: "Remembers childhood" },
            { type: "sequel" as const, summary: "Contemplates nature of love" },
          ], chapterNumber: 5 },
        { beats: [
            { type: "scene" as const, summary: "Final battle" },
            { type: "sequel" as const, summary: "Aftermath" },
          ], chapterNumber: 10 },
      ];

      const errors = StructuralErrorDetector.detect(chapters);
      const sagging = errors.filter((e) => e.type === StructuralErrorType.SaggingMiddle());
      expect(sagging.length).toBeGreaterThan(0);
      expect(sagging.some((e) => e.chapterRef === 5)).toBe(true);
    });

    it("does not flag balanced middle", () => {
      const chapters: ChapterData[] = [
        { beats: [
            { type: "scene" as const, summary: "Confronts ally" },
            { type: "sequel" as const, summary: "Decides to trust" },
          ], chapterNumber: 5 },
      ];

      const errors = StructuralErrorDetector.detect(chapters);
      const sagging = errors.filter((e) => e.type === StructuralErrorType.SaggingMiddle());
      expect(sagging.length).toBe(0);
    });
  });

  describe("Early Resolution", () => {
    it("detects conflict resolved before Act 3", () => {
      const chapters: ChapterData[] = [
        { beats: [
            { type: "scene" as const, summary: "Fights villain" },
            { type: "sequel" as const, summary: "Villain surrenders" },
          ], chapterNumber: 3 },
        { beats: [
            { type: "sequel" as const, summary: "Everyone celebrates" },
          ], chapterNumber: 4 },
      ];

      const errors = StructuralErrorDetector.detect(chapters);
      const early = errors.filter((e) => e.type === StructuralErrorType.EarlyResolution());
      expect(early.length).toBeGreaterThan(0);
    });
  });

  describe("Episodicity", () => {
    it("detects disconnected events", () => {
      const chapters: ChapterData[] = [
        { beats: [
            { type: "scene" as const, summary: "Finds a mysterious ring" },
          ], chapterNumber: 1 },
        { beats: [
            { type: "scene" as const, summary: "Goes to a bakery" },
          ], chapterNumber: 2 },
        { beats: [
            { type: "scene" as const, summary: "Watches a parade" },
          ], chapterNumber: 3 },
      ];

      const errors = StructuralErrorDetector.detect(chapters);
      const episodic = errors.filter((e) => e.type === StructuralErrorType.Episodicity());
      expect(episodic.length).toBeGreaterThan(0);
    });
  });
});
```

- [ ] **Step 2: Write implementation**

```typescript
// src/domain/structural-errors.ts
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
    const middleEnd = Math.floor(totalChapters * 0.75);

    for (let i = middleStart; i < middleEnd; i++) {
      const chapter = chapters[i];
      const sequelCount = chapter.beats.filter((b) => b.type === "sequel").length;
      const totalCount = chapter.beats.length;

      // If a chapter in the middle has 70%+ sequels and 0 scenes, flag it
      if (totalCount > 0 && sequelCount / totalCount > 0.7) {
        errors.push({
          type: StructuralErrorType.SaggingMiddle(),
          chapterRef: chapter.chapterNumber,
          message: `Capítulo ${chapter.chapterNumber}: excesso de reflexão sem progressão. ${sequelCount}/${totalCount} beats são Sequelas sem avanço de cena.`,
        });
      }
    }

    return errors;
  }

  private static detectEarlyResolution(chapters: ChapterData[]): StructuralError[] {
    const errors: StructuralError[] = [];
    const totalChapters = chapters.length;
    if (totalChapters < 3) return errors;

    const act3Start = Math.floor(totalChapters * 0.7);

    for (let i = 0; i < act3Start; i++) {
      const chapter = chapters[i];
      const hasResolution = chapter.beats.some((b) =>
        /surrender|surren|derrota|resolvid|vencido|celebrates|celebra|acabou|fim definitivo/i.test(
          b.summary,
        ),
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

  private static detectEpisodicity(chapters: ChapterData[]): StructuralError[] {
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

      // Heuristic: if no significant words overlap between consecutive chapters
      const prevWords = new Set(
        prevSummary.split(/\s+/).filter((w) => w.length > 4)
      );
      const currentWords = currentSummary.split(/\s+/).filter((w) => w.length > 4);
      const sharedWords = currentWords.filter((w) => prevWords.has(w));

      if (prevWords.size > 2 && currentWords.length > 2 && sharedWords.length === 0) {
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
```

- [ ] **Step 3: Run tests, commit**

Command: `npm run test -- --run src/domain/structural-errors.test.ts`

```bash
git add src/domain/structural-errors.ts src/domain/structural-errors.test.ts
git commit -m "feat(domain): add StructuralErrorDetector with 3 heuristic rules (M4.5)"
```

---

## Task 7: GenerateBeatSheetUseCase

**Files:**
- Create: `src/application/structure/generate-beat-sheet.ts`
- Create: `src/application/structure/generate-beat-sheet.test.ts`

- [ ] **Step 1: Write test**

```typescript
// src/application/structure/generate-beat-sheet.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GenerateBeatSheet-UseCase } from "./generate-beat-sheet";
import { LlmPort } from "../../domain/ideation/ports/llm-port";
import { ChapterId } from "../../domain/value-objects/chapter-id";
import { NarrativeFramework } from "../../domain/narrative-framework";

function makeMockLlmPort(response: string): LlmPort {
  return {
    complete: vi.fn().mockResolvedValue({ text: response }),
  };
}

describe("GenerateBeatSheetUseCase", () => {
  it("generates beat sheet and returns ChapterOutline", async () => {
    const mockResponse = JSON.stringify({
      beats: [
        {
          type: "scene",
          goal: "Find the hidden map",
          conflict: "The library is on fire",
          disaster: "no-and-worse",
        },
        {
          type: "sequel",
          reaction: "Panics about losing the map",
          dilemma: [
            "Run into the burning library (die)",
            "Abandon the quest (fail forever)",
            "Wait for firemen (lose time)",
          ],
          decision: "Decides to run in with wet clothes",
        },
      ],
      cliffhanger: {
        type: "climactic",
        description: "Finds the map but it's a fake",
      },
      startPolarity: "positive",
      endPolarity: "negative",
    });

    const llmPort = makeMockLlmPort(mockResponse);
    const useCase = new GenerateBeatSheetUseCase(llmPort);

    const result = await useCase.execute({
      chapterId: ChapterId.generate(),
      chapterNumber: 1,
      context: {
        framework: NarrativeFramework.HeroesJourney(),
        previousChapterSummary: "Protagonist discovers the old library exists",
        protagonistName: "Elena",
        protagonistGoal: "Find her grandfather's map",
      },
    });

    expect(result.isSuccess()).toBe(true);
    expect(result.outline.beatCount()).toBe(3); // 2 beats + cliffhanger
    expect(result.outline.hasCliffhanger()).toBe(true);
  });

  it("throws when LLM returns unparseable response", async () => {
    const llm_port = makeMockLlmPort("not json");
    const useCase = new GenerateBeatSheetUseCase(llm_port);

    await expect(
      useCase.execute({
        chapterId: ChapterId.generate(),
        chapterNumber: 1,
        context: {
          framework: NarrativeFramework.Kishotenketsu(),
          previousChapterSummary: "",
          protagonistName: "Test",
          protagonistGoal: "Goal",
        },
      })
    ).rejects.toThrow("Failed to parse LLM response");
  });
});
```

- [ ] **Step 2: Write implementation**

```typescript
// src/application/structure/generate-beat-sheet.ts
import { LlmPort, LlmResponse } from "../../domain/ideation/ports/llm-port";
import { ChapterId } from "../../domain/value-objects/chapter-id";
import { ChapterOutline } from "../../domain/chapter-outline";
import { SceneBeat, DisasterType } from "../../domain/scene-beat";
import { SequelBeat } from "../../domain/sequel-beat";
import { Cliffhanger, CliffhangerType } from "../../domain/cliffhanger";
import { ScenePolarity } from "../../domain/scene-grid";
import { NarrativeFramework } from "domain/narrative-framework";

export interface BeatSheetContext {
  framework: NarrativeFramework;
  previousChapterSummary: string;
  protagonistName: string;
  protagonistGoal: string;
}

export interface BeatSheetRequest {
  chapterId: ChapterId;
  chapterNumber: number;
  context: BeatSheetContext;
}

export interface BeatSheetResult {
  isSuccess(): boolean;
  outline: ChapterOutline;
  violations: string[];
}

const DISASTER_MAP: Record<string, DisasterType> = {
  no: DisasterType.No(),
  "no-and-worse": DisasterType.NoAndWorse(),
  "yes-but": DisasterType.YesBut(),
};

const CLIFFHANGER_MAP: Record<string, CliffhangerType> = {
  "pre-point": CliffhangerType.PrePoint(),
  climactic: CliffhangerType.Climactic(),
  "post-point": CliffhangerType.PostPoint(),
};

export class GenerateBeatSheetUseCase {
  constructor(private readonly llmPort: LlmPort) {}

  async execute(request: BeatSheetRequest): Promise<BeatSheetResult> {
    const prompt = this.buildPrompt(request);
    const response = await this.llmPort.complete(prompt, {
      temperature: 0.8,
      maxTokens: 2000,
    });

    if (!response.text) {
      throw new Error("Empty response from LLM");
    }

    const parsed = this.parseLlmResponse(response.text);
    const outline = this.buildOutline(request, parsed);
    const violations = this.validateOutline(outline);

    return {
      isSuccess: () => violations.length === 0,
      outline,
      violations,
    };
  }

  private buildPrompt(request: BeatSheetRequest): string {
    const { context } = request;
    const beatLabels = context.framework
      ? context.framework.name
      : "Cena e Sequela";

    return `You are a professional narrative architect applying Dwight Swain's Scene & Sequel pattern.

CONTEXT:
- Framework: ${beatLabels}
- Previous chapter: "${context.previousChapterSummary}"
- Protagonist: ${context.protagonistName}
- Goal: ${context.protagonistGoal}

INSTRUCTIONS:
Apply Cena e Sequela de Dwight Swain.
Format: BEAT 1 (CENA): Objetivo/Conflito/Desastre
         BEAT 2 (SEQUELA): Reação/Dilema/Decisão
Transição Story Grid: De [+/-] Para [-/+]
Tipo de Cliffhanger: [Pre-point/Climactic/Post-point]
PROIBIDO gerar resoluções pacíficas ao final.

Return a JSON object with:
{
  "beats": [
    {"type": "scene", "goal": "", "conflict": "", "disaster": "no|no-and-worse|yes-but"},
    {"type": "sequel", "reaction": "", "dilemma": ["", "", ""], "decision": ""}
  ],
  "cliffhanger": {"type": "pre-point|climactic|post-point", "description": ""},
  "startPolarity": "positive|negative",
  "endPolarity": "positive|negative"
}

Chapter ${request.chapterNumber}. Respond with valid JSON only.`;
  }

  private parseLlmResponse(text: string): any {
    try {
      // Handle markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      const cleanJson = jsonMatch ? jsonMatch[1] : text;
      return JSON.parse(cleanJson);
    } catch {
      throw new Error(`Failed to parse LLM response: ${text.substring(0, 100)}`);
    }
  }

  private buildOutline(request: BeatSheetRequest, parsed: any): ChapterOutline {
    const beats: (SceneBeat | SequelBeat)[] = [];

    for (const beat of parsed.beats) {
      if (beat.type === "scene") {
        const disaster = DISASTER_MAP[beat.disaster] || DisasterType.No();
        beats.push(SceneBeat.create(beat.goal, beat.conflict, disaster));
      } else {
        beats.push(SequelBeat.create(beat.reaction, beat.dilemma, beat.decision));
      }
    }

    const cliffhanger = Cliffhanger.create(
      CLIFFHANGER_MAP[parsed.cliffhanger.type] || CliffhangerType.PrePoint(),
      parsed.cliffhanger.description,
    );

    const startPolarity = ScenePolarity.create(
      parsed.startPolarity as "positive" | "negative",
    );
    const endPolarity = ScenePolarity.create(
      parsed.endPolarity as "positive" | "negative",
    );

    return ChapterOutline.create(
      request.chapterId,
      request.chapterNumber,
      beats,
      cliffhanger,
      startPolarity,
      endPolarity,
    );
  }

  private validateOutline(outline: ChapterOutline): string[] {
    const violations: string[] = [];

    if (outline.hasPolarityWarning()) {
      violations.push(outline.getPolarityWarning()!);
    }

    return violations;
  }
}
```

- [ ] **Step 3: Run tests, fix import if needed, commit**

Command: `npm run test -- --run src/application/structure/generate-beat-sheet.test.ts`

**Fix:** If there's a TS error on the import, make sure the path is correct: `../../domain/narrative-framework` (relative).

```bash
git add src/application/structure/generate-beat-sheet.ts src/application/structure/generate-beat-sheet.test.ts
git commit -m "feat(application): add GenerateBeatSheetUseCase with DRTD prompt (M4.4)"
```

---

## Task 8: DetectStructuralErrorsUseCase

**Files:**
- Create: `src/application/structure/detect-structural-errors.ts`
- Create: `src/application/structure/detect-structural-errors.test.ts`

- [ ] **Step 1: Write test**

```typescript
// src/application/structure/detect-structural-errors.test.ts
import { describe, it, expect } from "vitest";
import { DetectStructuralErrorsUseCase } from "./detect-structural-errors";

describe("DetectStructuralErrorsUseCase", () => {
  it("returns empty array for well-structured story", async () => {
    const useCase = new DetectStructuralErrorsUseCase();

    const chapters = Array.from({ length: 8 }, (_, i) => ({
      beats: [
        { type: "scene" as const, summary: "Action in chapter " + (i + 1) },
        { type: "sequel" as const, summary: "Reaction in chapter " + (i + 1) },
      ],
      chapterNumber: i + 1,
    }));

    const errors = useCase.execute(chapters);
    expect(errors).toHaveLength(0);
  });

  it("detects sagging middle", async () => {
    const useCase = new DetectStructuralErrorsUseCase();

    const chapters = [
      { beats: [{ type: "scene" as const, summary: "Fight" }], chapterNumber: 1 },
      { beats: [{ type: "scene" as const, summary: "Journey" }], chapterNumber: 2 },
      { beats: [{ type: "sequel" as const, summary: "Thinks about life" }, { type: "sequel" as const, summary: "Remembers childhood" }, { type: "sequel" as const, summary: "Contemplates love" }], chapterNumber: 3 },
      { beats: [{ type: "sequel" as const, summary: "Philosophizes" }, { type: "sequel" as const, summary: "Meditates" }, { type: "sequel" as const, summary: "Reflects" }], chapterNumber: 4 },
      { beats: [{ type: "sequel" as const, summary: "Dreams" }, { type: "sequel" as const, summary: "Nostalgia" }, { type: "sequel" as const, summary: "Contemplates" }], chapterNumber: 5 },
      { beats: [{ type: "scene" as const, summary: "Battle" }], chapterNumber: 6 },
      { beats: [{ type: "scene" as const, summary: "Victory" }], chapterNumber: 7 },
      { beats: [{ type: "scene" as const, summary: "End" }], chapterNumber: 8 },
    ];

    const errors = useCase.execute(chapters);
    const sagging = errors.filter((e) => e.type.value === "sagging-middle");
    expect(sagging.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Write implementation**

```typescript
// src/application/structure/detect-structural-errors.ts
import {
  StructuralErrorDetector,
  StructuralError,
  ChapterData,
} from "../../domain/structural-errors";

export class DetectStructuralErrorsUseCase {
  execute(chapters: ChapterData[]): StructuralError[] {
    return StructuralErrorDetector.detect(chapters);
  }
}
```

- [ ] **Step 3: Run tests, commit**

Command: `npm run test -- --run src/application/structure/detect-structural-errors.test.ts`

```bash
git add src/application/structure/detect-structural-errors.ts src/application/structure/detect-structural-errors.test.ts
git commit -m "feat(application): add DetectStructuralErrorsUseCase (M4.5)"
```

---

## Task 9: Update DummyLlmPort with Beat Sheet Mock

**Files:**
- Modify: `src/infrastructure/llm/dummy-llm-port.ts`

- [ ] **Step 1: Add beat sheet mock response**

Append to the `complete` method, before the final `return`:

```typescript
// Add before the final return line in dummy-llm-port.ts

    // Beat Sheet Generation
    if (prompt.includes("Dwight Swain") || prompt.includes("Cena e Sequela")) {
      return {
        text: JSON.stringify({
          beats: [
            {
              type: "scene",
              goal: "Find the hidden map in the old library",
              conflict: "The library is on fire and guarded by a hostile librarian",
              disaster: "no-and-worse",
            },
            {
              type: "sequel",
              reaction: "Panics thinking about losing the only connection to grandfather",
              dilemma: [
                "Run into the burning library and risk death",
                "Abandon the quest and fail forever",
                "Wait for firemen and lose the map to looters",
              ],
              decision: "Decides to run in with wet clothes",
            },
          ],
          cliffhanger: {
            type: "climactic",
            description: "Finds the map but realizes it is a fake — the real one was taken",
          },
          startPolarity: "positive",
          endPolarity: "negative",
        }),
      };
    }
```

- [ ] **Step 2: Run full test suite to verify nothing broke**

Command: `npm run test -- --run`

```bash
git add src/infrastructure/llm/dummy-llm-port.ts
git commit -m "test(infra): add beat sheet mock response to DummyLlmPort (M4.4)"
```

---

## Task 10: UI — Structure Page (`/structure`)

**Files:**
- Create: `src/ui/components/structure/structure-page.tsx`
- Modify: `src/ui/App.tsx` (or routing file) — add route

Let me first check the current routing setup:

- [ ] **Step 0: Check existing routing** (read App.tsx or router config first before modifying)

- [ ] **Step 1: Create structure page component**

```tsx
// src/ui/components/structure/structure-page.tsx
import { useState } from "react";
import { NarrativeFramework, BEATS_MAP } from "../../domain/narrative-framework";
import { StoryStructure } from "../../domain/story-structure";

export default function StructurePage() {
  const frameworks = NarrativeFramework.all();
  const [selected, setSelected] = useState<NarrativeFramework>(frameworks[0]);
  const [beats, setBeats] = useState<string[]>(
    Array(BEATS_MAP[selected.name]).fill(""),
  );

  const structure = StoryStructure.create(selected, beats);

  function handleSelect(fw: NarrativeFramework) {
    setSelected(fw);
    setBeats(Array(BEATS_MAP[fw.name]).fill(""));
  }

  function updateBeat(index: number, value: string) {
    const updated = [...beats];
    updated[index] = value;
    setBeats(updated);
  }

  const missingCount = structure.missingBeats().length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Estrutura Narrativa</h1>

      {/* Framework Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {frameworks.map((fw) => (
          <button
            key={fw.value}
            onClick={() => handleSelect(fw)}
            className={`p-3 rounded-lg border text-left transition-colors ${
              selected.value === fw.value
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-zinc-800 border-zinc-700 hover:border-zinc-500"
            }`}>
            <div className="font-medium">{fw.name}</div>
            <div className="text-sm opacity-70">
              {BEATS_MAP[fw.name].length} beats
            </div>
          </button>
        ))}
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900">
        <span className="text-sm">
          {structure.isSuccess() ? (
            <span className="text-green-400">Estrutura completa</span>
          ) : (
            <span className="text-yellow-400">
              {missingCount} beat{missingCount > 1 ? "s" : ""} pendente{missingCount > 1 ? "s" : ""}
            </span>
          )}
        </span>
        <div className="flex-1 bg-zinc-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{
              width: `${((structure.beatCount() - missingCount) / structure.beatCount()) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Beat Cards */}
      <div className="space-y-4">
        {BEATS_MAP[selected.name].map((label, i) => (
          <div
            key={label}
            className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-zinc-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-medium">{label}</span>
              {beats[i] ? (
                <span className="ml-auto text-green-400 text-sm">Preenchido</span>
              ) : (
                <span className="ml-auto text-zinc-500 text-sm">Vazio</span>
              )}
            </div>
            <textarea
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm resize-y min-h-[60px]"
              placeholder={`Descreva o beat: ${label}`}
              value={beats[i]}
              onChange={(e) => updateBeat(i, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Task 11: UI — Chapters Page (`/chapters`)

**Files:**
- Create: `src/ui/components/chapters/chapters-page.tsx`

- [ ] **Step 1: Create chapters page component**

```tsx
// src/ui/components/chapters/chapters-page.tsx
import { useState } from "react";
import { ChapterId } from "../../domain/value-objects/chapter-id";
import { ChapterOutline } from "../../domain/chapter-outline";
import { SceneBeat, DisasterType } from "../../domain/scene-beat";
import { SequelBeat } from "../../domain/sequel-beat";
import { Cliffhanger, CliffhangerType } from "../../domain/cliffhanger";
import { ScenePolarity } from "../../domain/scene-grid";

// Demo data — replace with actual data from repository in M4.6 integration
function createDemoOutlines(): ChapterOutline[] {
  const scene = SceneBeat.create(
    "Find the hidden map",
    "Library is on fire",
    DisasterType.NoAndWorse(),
  );
  const sequel = SequelBeat.create(
    "Panics about losing connection to grandfather",
    [
      "Run into fire (die)",
      "Abandon quest (fail forever)",
      "Wait for firemen (lose to looters)",
    ],
    "Decides to run in with wet clothes",
  );
  const cliff = Cliffhanger.create(
    CliffhangerType.Climactic(),
    "Finds the map but it's a fake",
  );

  return [
    ChapterOutline.create(
      ChapterId.generate(),
      1,
      [scene, sequel],
      cliff,
      ScenePolarity.create("positive"),
      ScenePolarity.create("negative"),
    ),
    ChapterOutline.create(
      ChapterId.generate(),
      2,
      [scene, sequel],
      Cliffhanger.create(CliffhangerType.PrePoint(), "Discovers an ally is a traitor"),
      ScenePolarity.create("negative"),
      ScenePolarity.create("positive"),
    ),
  ];
}

export default function ChaptersPage() {
  const [outlines] = useState<ChapterOutline[]>(() => createDemoOutlines());
  const [selectedChapter, setSelectedChapter] = useState<number>(0);
  const outline = outlines[selectedChapter];

  if (!outline) return <div className="p-6">No chapters planned yet.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Planejamento de Capítulos</h1>

      {/* Chapter List */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {outlines.map((o, i) => (
          <button
            key={o.getChapterNumber()}
            onClick={() => setSelectedChapter(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              i === selectedChapter
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Cap. {o.getChapterNumber()}
          </button>
        ))}
      </div>

      {/* Polarity Indicator */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Polaridade:</span>
          <span
            className={`px-2 py-1 rounded text-sm font-mono ${
              outline.hasPolarityWarning()
                ? "bg-red-900 text-red-300"
                : "bg-green-900 text-green-300"
            }`}
          >
            {outline.getStartPolarity?.() ?? "+"} &rarr; {outline.getEndPolarity?.() ?? "-"}
          </span>
          {outline.hasPolarityWarning() && (
            <span className="text-xs text-red-400 ml-2">
              ⚠ {outline.getPolarityWarning()}
            </span>
          )}
        </div>
      </div>

      {/* Beats List */}
      <div className="space-y-3">
        {outline.getBeats().map((beat, i) => {
          const isScene = "goal" in beat;

          return (
            <div
              key={i}
              className={`p-4 rounded-lg border ${
                isScene
                  ? "bg-blue-950 border-blue-800"
                  : "bg-amber-950 border-amber-800"
              }`}>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    isScene
                      ? "bg-blue-600 text-white"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  {isScene ? "CENA" : "SEQUELA"}
                </span>
                <span className="text-xs text-zinc-500">Beat {i + 1}</span>
              </div>

              {isScene ? (
                <div className="space-y-1 text-sm">
                  <div><span className="text-zinc-400">Objetivo:</span> {(beat as SceneBeat).goal}</div>
                  <div><span className="text-zinc-400">Conflito:</span> {(beat as SceneBeat).conflict}</div>
                  <div><span className="text-zinc-400">Desastre:</span> {(beat as SceneBeat).disaster.label}</div>
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <div><span className="text-zinc-400">Reação:</span> {(beat as SequelBeat).reaction}</div>
                  <div>
                    <span className="text-zinc-400">Dilema:</span>
                    <ul className="list-disc list-inside ml-2">
                      {(beat as SequelBeat).dilemmaOptions.map((opt, j) => (
                        <li key={j} className="text-zinc-300">{opt}</li>
                      ))}
                    </ul>
                  </div>
                  <div><span className="text-zinc-400">Decisão:</span> {(beat as SequelBeat).decision}</div>
                </div>
              )}
            </div>
          );
        })}

        {/* Cliffhanger */}
        <div className="p-4 rounded-lg border border-red-800 bg-red-950">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white">
              CLIFFHANGER
            </span>
            <span className="text-xs text-zinc-500">
              {outline.getCliffhanger().type.label}
            </span>
          </div>
          <p className="text-sm text-zinc-300">
            {outline.getCliffhanger().description}
          </p>
        </div>
      </div>
    </div>
  );
}
```

Note: In the `ChapterOutline` class, I need to add getters for start and end polarity. Let me add to the Task 5 implementation:

```typescript
  // Add to ChapterOutline class:
  getStartPolarity(): string {
    return this.startPolarity.toString();
  }

  getEndPolarity(): string {
    return this.endPolarity.toString();
  }
```

- [ ] **Step 2: Add routes to App.tsx** (check existing routing first)

- [ ] **Step 3: Run dev server to visually verify**

Command: `npm run dev`

```bash
git add src/ui/components/structure/structure-page.tsx src/ui/components/chapters/chapters-page.tsx
git commit -m "feat(ui): add /structure and /chapters pages with framework selector and beat visualization (M4.6)"
```

---

## Task 12: Export Index, Run Full Test Suite, Final Commit

**Files:**
- Modify: `src/domain/result.ts` (if needed to export Result)
- Check: all imports resolve correctly

- [ ] **Step 1: Run full test suite**

Command: `npm run test -- --run`

- [ ] **Step 2: Run lint check**

Command: `npm run lint`

- [ ] **Step 3: Run TypeScript check**

Command: `npx tsc --noEmit`

- [ ] **Step 4: Verify coverage**

Command: `npm run test -- --run --coverage`

```bash
git commit --allow-empty -m "chore(milestone-4): complete Milestone 4 — Narrative Structure & Chapter Architect"
```

---

## Summary of Tasks

| Task | What | Files Created | Est. Commits |
|------|------|--------------|-------------|
| 1 | SceneId & ChapterId VOs | 4 files | 1 |
| 2 | NarrativeFramework + StoryStructure | 4 files | 1 |
| 3 | ScenePolarity + StoryGridValidator | 2 files | 1 |
| 4 | SceneBeat + SequelBeat | 4 files | 1 |
| 5 | Cliffhanger + ChapterOutline | 4 files | 1 |
| 6 | StructuralErrorDetector | 2 files | 1 |
| 7 | GenerateBeatSheetUseCase | 2 files | 1 |
| 8 | DetectStructuralErrorsUseCase | 2 files | 1 |
| 9 | Update DummyLlmPort for beat sheets | 1 file modified | 1 |
| 10 | UI: /structure page | 1 file + route | 1 |
| 11 | UI: /chapters page | 1 file + route | 1 |
| 12 | Final verification & coverage | - | 1 |

**Total: ~32 new files, 2 modified, ~12 commits**
