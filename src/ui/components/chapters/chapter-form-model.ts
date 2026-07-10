import { ChapterOutline } from "../../../domain/chapter-outline";
import { SceneBeat, DisasterType } from "../../../domain/scene-beat";
import { SequelBeat } from "../../../domain/sequel-beat";
import { Cliffhanger, CliffhangerType } from "../../../domain/cliffhanger";
import { ScenePolarity } from "../../../domain/scene-grid";
import { ChapterId } from "../../../domain/value-objects/chapter-id";

export interface BeatFormValues {
  type: "scene" | "sequel";
  goal: string;
  conflict: string;
  disaster: string;
  reaction: string;
  dilemma: string; // uma opção por linha
  decision: string;
}

export interface ChapterFormValues {
  beats: BeatFormValues[];
  cliffhangerType: string;
  cliffhangerDescription: string;
  startPolarity: "positive" | "negative";
  endPolarity: "positive" | "negative";
}

export function emptyBeat(type: "scene" | "sequel"): BeatFormValues {
  return { type, goal: "", conflict: "", disaster: "yes-but", reaction: "", dilemma: "", decision: "" };
}

export function defaultFormValues(): ChapterFormValues {
  return {
    // Mínimo do domínio: 3 beats + cliffhanger — padrão Cena→Sequela→Cena de Swain
    beats: [emptyBeat("scene"), emptyBeat("sequel"), emptyBeat("scene")],
    cliffhangerType: "climactic",
    cliffhangerDescription: "",
    startPolarity: "positive",
    endPolarity: "negative",
  };
}

export function formValuesFromOutline(outline: ChapterOutline): ChapterFormValues {
  return {
    beats: outline.getBeats().map(beatToFormValues),
    cliffhangerType: outline.getCliffhanger().type.value,
    cliffhangerDescription: outline.getCliffhanger().description,
    startPolarity: outline.getStartPolarity() === "+" ? "positive" : "negative",
    endPolarity: outline.getEndPolarity() === "+" ? "positive" : "negative",
  };
}

function beatToFormValues(beat: SceneBeat | SequelBeat): BeatFormValues {
  if (beat instanceof SceneBeat) {
    return {
      ...emptyBeat("scene"),
      goal: beat.goal,
      conflict: beat.conflict,
      disaster: beat.disaster.value,
    };
  }
  return {
    ...emptyBeat("sequel"),
    reaction: beat.reaction,
    dilemma: beat.dilemmaOptions.join("\n"),
    decision: beat.decision,
  };
}

export function outlineFromFormValues(
  values: ChapterFormValues,
  chapterNumber: number,
  id: ChapterId,
): ChapterOutline {
  return ChapterOutline.create(
    id,
    chapterNumber,
    values.beats.map(beatToDomain),
    Cliffhanger.create(
      CliffhangerType.fromValue(values.cliffhangerType) ?? CliffhangerType.Climactic(),
      values.cliffhangerDescription,
    ),
    ScenePolarity.create(values.startPolarity),
    ScenePolarity.create(values.endPolarity),
  );
}

function beatToDomain(values: BeatFormValues): SceneBeat | SequelBeat {
  if (values.type === "scene") {
    return SceneBeat.create(
      values.goal,
      values.conflict,
      DisasterType.fromValue(values.disaster) ?? DisasterType.YesBut(),
    );
  }
  const options = values.dilemma.split("\n").map((o) => o.trim()).filter(Boolean);
  return SequelBeat.create(values.reaction, options, values.decision);
}

// Invariantes do domínio lançam mensagens em inglês; a UI fala pt-BR.
const ERROR_TRANSLATIONS: ReadonlyArray<[RegExp, string]> = [
  [/goal must not be empty/i, "Preencha o objetivo de todas as cenas."],
  [/conflict must not be empty/i, "Preencha o conflito de todas as cenas."],
  [/reaction must not be empty/i, "Preencha a reação de todas as sequelas."],
  [/at least 2 options/i, "O dilema precisa de pelo menos 2 opções (uma por linha)."],
  [/bad or carry heavy cost/i, "Todas as opções do dilema devem ser ruins ou ter custo alto."],
  [/decision must not be empty/i, "Preencha a decisão de todas as sequelas."],
  [/cliffhanger description/i, "Descreva o cliffhanger do capítulo."],
  [/minimum of 4 beats/i, "O capítulo precisa de no mínimo 4 beats — adicione cenas ou sequelas."],
  [/clean success/i, "Sucesso limpo não é um desastre válido."],
];

export function translateDomainError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const hit = ERROR_TRANSLATIONS.find(([pattern]) => pattern.test(message));
  return hit ? hit[1] : `Capítulo inválido: ${message}`;
}
