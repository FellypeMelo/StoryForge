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
    expect(llmPort.complete).toHaveBeenCalledWith(
      expect.stringContaining('knight'),
      expect.anything()
    );
  });

  it('should invalidate a weak premise', async () => {
    const premise = new Premise(
      'Someone',
      'Something happens',
      'Someone else',
      'Nothing really happens if they fail'
    );

    const mockLlmResponse = {
      text: JSON.stringify({
        isValid: false,
        reason: 'Conflict is non-existent and stakes are absent.'
      }),
    };
    (llmPort.complete as any).mockResolvedValue(mockLlmResponse);

    const result = await useCase.execute(premise);

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('Conflict');
  });
});
