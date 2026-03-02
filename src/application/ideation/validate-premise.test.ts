import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidatePremiseUseCase } from './validate-premise';
import { Premise } from '../../domain/ideation/premise';
import { LlmPort } from '../../domain/ideation/ports/llm-port';

describe('ValidatePremiseUseCase', () => {
  let llmPort: LlmPort;
  let useCase: ValidatePremiseUseCase;

  beforeEach(() => {
    llmPort = {
      complete: vi.fn(),
    };
    useCase = new ValidatePremiseUseCase(llmPort);
  });

  it('should validate a strong premise', async () => {
    const premise = new Premise(
      'A brave knight',
      'The dragon returns',
      'The dragon',
      'The safety of the village and the lives of his family'
    );

    const mockLlmResponse = {
      text: JSON.stringify({
        isValid: true,
        reason: 'Strong conflict and clear stakes.'
      }),
    };
    (llmPort.complete as any).mockResolvedValue(mockLlmResponse);

    const result = await useCase.execute(premise);

    expect(result.isValid).toBe(true);
    expect(result.reason).toBe('Strong conflict and clear stakes.');
  });

  it('should handle missing reason from LLM', async () => {
    const premise = new Premise('P', 'I', 'A', 'Stakes are long enough here');
    (llmPort.complete as any).mockResolvedValue({ text: JSON.stringify({ isValid: true }) });

    const result = await useCase.execute(premise);
    expect(result.reason).toBe('No reason provided by LLM.');
  });

  it('should invalidate a weak premise', async () => {
    const premise = new Premise('P', 'I', 'A', 'Stakes are long enough here');
    (llmPort.complete as any).mockResolvedValue({ text: JSON.stringify({ isValid: false, reason: 'Weak' }) });

    const result = await useCase.execute(premise);
    expect(result.isValid).toBe(false);
  });

  it('should throw error if LLM returns invalid JSON', async () => {
    const premise = new Premise('P', 'I', 'A', 'Stakes are long enough here');
    (llmPort.complete as any).mockResolvedValue({ text: 'Invalid' });

    await expect(useCase.execute(premise)).rejects.toThrow('Failed to parse validation result from LLM');
  });
});
