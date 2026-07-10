import { CrossPollinationSeed } from "../../domain/ideation/cross-pollination-seed";
import { ClicheBlacklist } from "../../domain/ideation/cliche-blacklist";
import { Premise } from "../../domain/ideation/premise";
import { LlmPort } from "../../domain/ideation/ports/llm-port";
import { extractJson } from "../shared/extract-json";

export class GeneratePremisesUseCase {
  constructor(private readonly llmPort: LlmPort) {}

  async execute(seed: CrossPollinationSeed, blacklist: ClicheBlacklist): Promise<Premise[]> {
    const prompt = `Generate 3 unique story premises by cross-pollinating the ${seed.genre.value} genre with the academic discipline of ${seed.academicDiscipline.value}.
    
    CRITICAL: The premises must NOT include: ${blacklist.bannedTerms.join(", ")}.
    
    Return the result as a JSON array of objects with the following schema:
    [
      {
        "protagonist": "string",
        "incitingIncident": "string",
        "antagonist": "string",
        "stakes": "string (must be detailed and specific, at least 15 characters)"
      }
    ]
    No preamble, no explanation. Just the JSON array.`;

    const response = await this.llmPort.complete(prompt, { temperature: 0.8 });

    try {
      const parsed: unknown = extractJson(response.text);
      const list = toPremiseArray(parsed);
      if (list.length === 0) throw new Error("No premises in response");

      return list.map((p) => new Premise(p.protagonist, p.incitingIncident, p.antagonist, p.stakes));
    } catch {
      throw new Error("Failed to parse premises from LLM");
    }
  }
}

// Models return either a bare array or a wrapper object ({premises|data|result: [...]}).
function toPremiseArray(parsed: unknown): PremiseDraft[] {
  if (Array.isArray(parsed)) return parsed as PremiseDraft[];
  if (parsed && typeof parsed === "object") {
    const wrapper = Object.values(parsed as Record<string, unknown>).find(Array.isArray);
    if (wrapper) return wrapper as PremiseDraft[];
  }
  return [];
}

interface PremiseDraft {
  protagonist: string;
  incitingIncident: string;
  antagonist: string;
  stakes: string;
}
