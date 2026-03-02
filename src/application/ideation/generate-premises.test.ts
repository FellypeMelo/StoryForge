import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeneratePremisesUseCase } from './generate-premises';
import { CrossPollinationSeed } from '../../domain/ideation/cross-pollination-seed';
import { ClicheBlacklist } from '../../domain/ideation/cliche-blacklist';
import { Genre } from '../../domain/value-objects/genre';
import { AcademicDiscipline } from '../../domain/value-objects/academic-discipline';
import { LlmPort } from '../../domain/ideation/ports/llm-port';

describe('GeneratePremisesUseCase', () => {
  let llmPort: LlmPort;
  let useCase: GeneratePremisesUseCase;

  beforeEach(() => {
    llmPort = {
      complete: vi.fn(),
    };
    useCase = new GeneratePremisesUseCase(llmPort);
  });

  it('should generate 3 premises using cross-pollination and blacklist', async () => {
    const genre = Genre.create('Fantasy');
    const discipline = AcademicDiscipline.create('Marine Biology');
    const seed = new CrossPollinationSeed(genre, discipline);
    const blacklist = new ClicheBlacklist(genre, ['Chosen One', 'Magic Sword']);

    const mockLlmResponse = {
      text: JSON.stringify([
        {
          protagonist: 'A marine biologist',
          incitingIncident: 'Finds a telepathic coral',
          antagonist: 'Industrial polluters',
          stakes: 'The oceanic ecosystem will collapse if the coral dies'
        },
        {
          protagonist: 'A deep-sea diver',
          incitingIncident: 'Discovers an underwater portal',
          antagonist: 'Ancient sea gods',
          stakes: 'The surface world will be flooded by the rising tide'
        },
        {
          protagonist: 'An oceanic researcher',
          incitingIncident: 'Genetically engineers a kraken',
          antagonist: 'Corporate espionage',
          stakes: 'Her life work will be used as a biological weapon'
        }
      ]),
    };
    (llmPort.complete as any).mockResolvedValue(mockLlmResponse);

    const premises = await useCase.execute(seed, blacklist);

    expect(premises).toHaveLength(3);
    expect(llmPort.complete).toHaveBeenCalled();
    expect(premises[0].protagonist).toBe('A marine biologist');
  });

  it('should throw error if LLM returns not an array', async () => {
    const seed = new CrossPollinationSeed(Genre.create('Fantasy'), AcademicDiscipline.create('Physics'));
    const blacklist = new ClicheBlacklist(Genre.create('Fantasy'), ['Cliché']);
    (llmPort.complete as any).mockResolvedValue({ text: JSON.stringify({ key: 'value' }) });

    await expect(useCase.execute(seed, blacklist)).rejects.toThrow('Failed to parse premises from LLM');
  });

  it('should throw error if LLM returns invalid JSON', async () => {
    const seed = new CrossPollinationSeed(Genre.create('Fantasy'), AcademicDiscipline.create('Physics'));
    const blacklist = new ClicheBlacklist(Genre.create('Fantasy'), ['Cliché']);
    (llmPort.complete as any).mockResolvedValue({ text: 'Not JSON' });

    await expect(useCase.execute(seed, blacklist)).rejects.toThrow('Failed to parse premises from LLM');
  });
});
