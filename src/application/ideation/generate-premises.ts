import { CrossPollinationSeed } from '../../domain/ideation/cross-pollination-seed';
import { ClicheBlacklist } from '../../domain/ideation/cliche-blacklist';
import { Premise } from '../../domain/ideation/premise';
import { LlmPort } from '../../domain/ideation/ports/llm-port';

export class GeneratePremisesUseCase {
  constructor(private readonly llmPort: LlmPort) {}

  async execute(seed: CrossPollinationSeed, blacklist: ClicheBlacklist): Promise<Premise[]> {
    const prompt = `Generate 3 unique story premises by cross-pollinating the ${seed.genre.value} genre with the academic discipline of ${seed.academicDiscipline.value}.
    
    CRITICAL: The premises must NOT include: ${blacklist.bannedTerms.join(', ')}.
    
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
      const data = JSON.parse(response.text);
      if (!Array.isArray(data)) throw new Error('Response is not an array');

      return data.map((item: any) => new Premise(
        item.protagonist,
        item.incitingIncident,
        item.antagonist,
        item.stakes
      ));
    } catch (error) {
      throw new Error('Failed to parse premises from LLM');
    }
  }
}
