import { LlmPort } from "../../domain/ideation/ports/llm-port";
import { WritingRequest } from "../../domain/writing-request";
import { ProseOutput } from "../../domain/prose-output";
import { AiismDetector, type AiismScanResult } from "../../domain/aiism-detector";
import { AiismBlacklist } from "../../domain/aiism-blacklist";
import { MruValidator } from "../../domain/mru-validator";
import { EmotionPromptEnhancer } from "../../domain/emotion-prompt-enhancer";

export interface GenerateProseResult {
  isSuccess: boolean;
  proseOutput: ProseOutput;
  aiismScan: AiismScanResult;
  mruViolations: string[];
}

interface ParsedLlmResponse {
  draft: string;
  critique: string;
  finalVersion: string;
}

export class GenerateProseUseCase {
  constructor(
    private readonly llmPort: LlmPort,
    private readonly blacklist: AiismBlacklist | null = null,
  ) {}

  async execute(request: WritingRequest): Promise<GenerateProseResult> {
    const prompt = this.buildPrompt(request);
    const response = await this.llmPort.complete(prompt, {
      temperature: 0.9,
      maxTokens: 2500,
    });

    const parsed = this.parseResponse(response.text);
    const proseOutput = ProseOutput.create(parsed);
    const aiismScan = AiismDetector.scan(
      proseOutput.finalVersion,
      this.blacklist ?? AiismBlacklist.default(),
    );
    const mruResult = MruValidator.scan(proseOutput.finalVersion);

    return {
      isSuccess: true,
      proseOutput,
      aiismScan,
      mruViolations: mruResult.violations.map((v) => v.suggestion),
    };
  }

  private buildPrompt(request: WritingRequest): string {
    let prompt = `You are a professional literary novelist writing visceral, grounded prose.

CONTEXT:
- Beat: ${request.beatSummary}
- POV: ${request.pov.toString()} (${request.pov.label})
- Character: ${request.characterName}
- Target: ${request.wordLimit} words

THREE-STEP RSIP PROCESS:
Passo 1: Write the visceral draft. Raw, immediate prose. Show, don't tell. Ground the reader in sensory detail. No AI-isms.`;

    if (request.ragContext) {
      prompt += `\n\nSTORY CONTEXT:\n${request.ragContext}`;
    }

    if (this.blacklist) {
      const bannedTerms = this.blacklist.getAllTerms().join(", ");
      prompt += `\n\nNEGATIVE GUARDRAILS — DO NOT USE:\n${bannedTerms}`;
    }

    prompt += `\n\nPasso 2: Critique the draft. Point out exactly 2 instances of 'Tell' or melodrama.
Passo 3: Provide the VERSÃO FINAL — a polished, visceral revision that fixes all issues.

Respond as JSON:
{"draft": "...", "critique": "...", "finalVersion": "..."}`;

    prompt += `\n\n${EmotionPromptEnhancer.enhance("Write with literary weight.", request.emotionalIntensity)}`;

    return prompt;
  }

  private parseResponse(text: string): ParsedLlmResponse {
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
}
