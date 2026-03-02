import { LlmPort } from '../../domain/ideation/ports/llm-port';
import { WorldRuleRepository } from '../../domain/ports/world-rule-repository';
import { ProjectId } from '../../domain/value-objects/project-id';
import { Premise } from '../../domain/ideation/premise';
import { WorldRule } from '../../domain/world-rule';
import { WorldRuleId } from '../../domain/value-objects/codex-ids';

export class WorldbuildingPipeline {
  constructor(
    private readonly llmPort: LlmPort,
    private readonly worldRuleRepository: WorldRuleRepository
  ) {}

  async run(projectId: ProjectId, premise: Premise): Promise<void> {
    // Step 1: Physics/Magic
    const physicsPrompt = `Based on the story premise: "${premise.incitingIncident}", define the fundamental Physics or Magic System of this world. 
    Focus on rules, limitations, and costs. No preamble.`;
    const physicsResponse = await this.llmPort.complete(physicsPrompt, { temperature: 0.7 });
    await this.saveRule(projectId, 'Physics/Magic', physicsResponse.text);

    // Step 2: Economy
    const economyPrompt = `Given these world physics/magic rules: "${physicsResponse.text}", derive the Global Economy. 
    How are resources gathered, traded, and who controls them? No preamble.`;
    const economyResponse = await this.llmPort.complete(economyPrompt, { temperature: 0.7 });
    await this.saveRule(projectId, 'Economy', economyResponse.text);

    // Step 3: Sociology/Religion
    const sociologyPrompt = `Given the economy: "${economyResponse.text}", derive the Sociology and Religion of this world. 
    How do people organize, what do they believe, and how does the economy shape their faith? No preamble.`;
    const sociologyResponse = await this.llmPort.complete(sociologyPrompt, { temperature: 0.7 });
    await this.saveRule(projectId, 'Sociology/Religion', sociologyResponse.text);

    // Step 4: Conflicts
    const conflictPrompt = `Based on the physics (${physicsResponse.text}), economy (${economyResponse.text}), and sociology (${sociologyResponse.text}) previously defined, identify the primary Zones of Cultural and Political Conflict. 
    Where do these systems clash? No preamble.`;
    const conflictResponse = await this.llmPort.complete(conflictPrompt, { temperature: 0.7 });
    await this.saveRule(projectId, 'Conflicts', conflictResponse.text);
  }

  private async saveRule(projectId: ProjectId, category: string, content: string): Promise<void> {
    const rule = WorldRule.create({
      id: WorldRuleId.generate(),
      projectId,
      category,
      content,
      hierarchy: 0
    });
    const result = await this.worldRuleRepository.save(rule);
    if (!result.success) {
      throw new Error(`Failed to save world rule: ${result.error.message}`);
    }
  }
}
