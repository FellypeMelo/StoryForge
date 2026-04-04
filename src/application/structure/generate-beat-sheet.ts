import { LlmPort } from "../../domain/ideation/ports/llm-port";
import { ChapterId } from "../../domain/value-objects/chapter-id";
import { ChapterOutline } from "../../domain/chapter-outline";
import { SceneBeat, DisasterType } from "../../domain/scene-beat";
import { SequelBeat } from "../../domain/sequel-beat";
import { Cliffhanger, CliffhangerType } from "../../domain/cliffhanger";
import { ScenePolarity } from "../../domain/scene-grid";
import { NarrativeFramework } from "../../domain/narrative-framework";

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

  private parseLlmResponse(text: string): unknown {
    try {
      const jsonMatch =
        text.match(/```json\s*([\s\S]*?)\s*```/) ||
        text.match(/```\s*([\s\S]*?)\s*```/);
      const cleanJson = jsonMatch ? jsonMatch[1] : text;
      return JSON.parse(cleanJson);
    } catch {
      throw new Error(`Failed to parse LLM response: ${text.substring(0, 100)}`);
    }
  }

  private buildOutline(request: BeatSheetRequest, parsed: unknown): ChapterOutline {
    const data = parsed as Record<string, unknown>;
    const beatsArray = data.beats as Array<Record<string, unknown>>;
    const beats: (SceneBeat | SequelBeat)[] = [];

    for (const beat of beatsArray) {
      if (beat.type === "scene") {
        const disaster =
          DISASTER_MAP[beat.disaster as string] || DisasterType.No();
        beats.push(
          SceneBeat.create(
            beat.goal as string,
            beat.conflict as string,
            disaster
          )
        );
      } else {
        const dilemmaOpts = beat.dilemma as string[];
        beats.push(
          SequelBeat.create(
            beat.reaction as string,
            dilemmaOpts,
            beat.decision as string
          )
        );
      }
    }

    const chData = data.cliffhanger as Record<string, string>;
    const cliffhanger = Cliffhanger.create(
      CLIFFHANGER_MAP[chData.type] || CliffhangerType.PrePoint(),
      chData.description
    );

    const startPolarity = ScenePolarity.create(
      (data.startPolarity as "positive" | "negative") ?? "positive"
    );
    const endPolarity = ScenePolarity.create(
      (data.endPolarity as "positive" | "negative") ?? "negative"
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
