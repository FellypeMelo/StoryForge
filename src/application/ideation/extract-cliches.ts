import { Genre } from '../../domain/value-objects/genre';
import { LlmPort } from '../../domain/ideation/ports/llm-port';
import { BlacklistRepository } from '../../domain/ports/blacklist-repository';
import { ClicheBlacklist } from '../../domain/ideation/cliche-blacklist';

export class ExtractClichesUseCase {
  constructor(
    private readonly llmPort: LlmPort,
    private readonly blacklistRepository: BlacklistRepository
  ) {}

  async execute(genre: Genre): Promise<ClicheBlacklist> {
    const prompt = `List 10 common cliches, tropes, and overused elements in the ${genre.value} genre. 
    Return them as a comma-separated list. No preamble, no explanation.`;

    const response = await this.llmPort.complete(prompt, { temperature: 0.7 });

    if (!response.text || response.text.trim().length === 0) {
      throw new Error('No cliches extracted from LLM');
    }

    const terms = response.text
      .split(',')
      .map((term) => term.trim())
      .filter((term) => term.length > 0);

    const blacklist = new ClicheBlacklist(genre, terms);
    await this.blacklistRepository.save(blacklist);

    return blacklist;
  }
}
