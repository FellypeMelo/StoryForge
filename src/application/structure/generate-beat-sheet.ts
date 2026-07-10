import { LlmPort } from "../../domain/ideation/ports/llm-port";
import { ChapterId } from "../../domain/value-objects/chapter-id";
import { ChapterOutline } from "../../domain/chapter-outline";
import { SceneBeat, DisasterType } from "../../domain/scene-beat";
import { SequelBeat } from "../../domain/sequel-beat";
import { Cliffhanger, CliffhangerType } from "../../domain/cliffhanger";
import { ScenePolarity } from "../../domain/scene-grid";
import { NarrativeFramework } from "../../domain/narrative-framework";
import { extractJson, asText, asTextArray } from "../shared/extract-json";

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

// Normalizes model polarity ("+", "positivo", "negative") to the domain's two values.
function coercePolarity(value: unknown, fallback: "positive" | "negative"): "positive" | "negative" {
  const t = asText(value).toLowerCase();
  if (t.startsWith("neg") || t.startsWith("-")) return "negative";
  if (t.startsWith("pos") || t.startsWith("+")) return "positive";
  return fallback;
}

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
Gere PELO MENOS 4 beats, alternando CENA e SEQUELA (ex: cena, sequela, cena, sequela).
BEAT CENA: Objetivo/Conflito/Desastre.
BEAT SEQUELA: Reação/Dilema/Decisão. Cada "dilema" DEVE ter exatamente 3 opções e TODAS
devem ser ruins ou de alto custo (use verbos como perder, sacrificar, trair, arriscar, sofrer, abandonar).
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

  private parseLlmResponse(text: string): unknown {
    try {
      return extractJson(text);
    } catch {
      throw new Error(`Failed to parse LLM response: ${text.substring(0, 100)}`);
    }
  }

  private buildOutline(request: BeatSheetRequest, parsed: unknown): ChapterOutline {
    const data = parsed as Record<string, unknown>;
    const beatsArray = Array.isArray(data.beats)
      ? (data.beats as Array<Record<string, unknown>>)
      : [];
    const beats: (SceneBeat | SequelBeat)[] = [];

    // Coerce each beat defensively and skip any that violate a domain invariant
    // (e.g. a dilemma the model phrased without heavy-cost options) instead of
    // crashing the whole generation on one malformed beat.
    for (const beat of beatsArray) {
      try {
        if (beat.type === "scene") {
          const disaster = DISASTER_MAP[asText(beat.disaster)] || DisasterType.No();
          beats.push(SceneBeat.create(asText(beat.goal), asText(beat.conflict), disaster));
        } else {
          beats.push(
            SequelBeat.create(asText(beat.reaction), asTextArray(beat.dilemma), asText(beat.decision)),
          );
        }
      } catch {
        continue;
      }
    }

    if (beats.length === 0) {
      throw new Error("O modelo não gerou beats válidos. Tente gerar novamente.");
    }

    const chData = (data.cliffhanger ?? {}) as Record<string, unknown>;
    const cliffhanger = Cliffhanger.create(
      CLIFFHANGER_MAP[asText(chData.type)] || CliffhangerType.PrePoint(),
      asText(chData.description) || "Cliffhanger não especificado pelo modelo.",
    );

    const startPolarity = ScenePolarity.create(coercePolarity(data.startPolarity, "positive"));
    const endPolarity = ScenePolarity.create(coercePolarity(data.endPolarity, "negative"));

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
