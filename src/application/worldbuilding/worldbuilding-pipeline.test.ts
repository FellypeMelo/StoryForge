import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorldbuildingPipeline } from './worldbuilding-pipeline';
import { LlmPort } from '../../domain/ideation/ports/llm-port';
import { WorldRuleRepository } from '../../domain/ports/world-rule-repository';
import { ProjectId } from '../../domain/value-objects/project-id';
import { Premise } from '../../domain/ideation/premise';

describe('WorldbuildingPipeline', () => {
  let llmPort: LlmPort;
  let worldRuleRepository: WorldRuleRepository;
  let pipeline: WorldbuildingPipeline;
  const projectId = ProjectId.generate();
  const premise = new Premise('P', 'I', 'A', 'Stakes are high enough');

  beforeEach(() => {
    llmPort = {
      complete: vi.fn(),
    };
    worldRuleRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByProject: vi.fn(),
      delete: vi.fn(),
    };
    pipeline = new WorldbuildingPipeline(llmPort, worldRuleRepository);
  });

  it('should execute all 4 steps of CAD in sequence', async () => {
    // Step 1: Physics
    (llmPort.complete as any).mockResolvedValueOnce({ text: 'Magic system rules...' });
    // Step 2: Economy
    (llmPort.complete as any).mockResolvedValueOnce({ text: 'Resource scarcity based on magic...' });
    // Step 3: Sociology
    (llmPort.complete as any).mockResolvedValueOnce({ text: 'Social classes based on economy...' });
    // Step 4: Conflicts
    (llmPort.complete as any).mockResolvedValueOnce({ text: 'Border wars over mana wells...' });

    (worldRuleRepository.save as any).mockResolvedValue({ success: true, data: undefined });

    await pipeline.run(projectId, premise);

    expect(llmPort.complete).toHaveBeenCalledTimes(4);
    expect(worldRuleRepository.save).toHaveBeenCalledTimes(4);
    
    // Check that context flows
    const calls = (llmPort.complete as any).mock.calls;
    expect(calls[1][0]).toContain('Magic system rules...');
    expect(calls[2][0]).toContain('Resource scarcity');
    expect(calls[3][0]).toContain('Social classes');
  });

  it('should throw error if repository fails to save', async () => {
    (llmPort.complete as any).mockResolvedValue({ text: 'Rules' });
    (worldRuleRepository.save as any).mockResolvedValue({ success: false, error: new Error('DB Error') });

    await expect(pipeline.run(projectId, premise)).rejects.toThrow('Failed to save world rule: DB Error');
  });
});
