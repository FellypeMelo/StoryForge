import { Premise } from "../../domain/ideation/premise";
import { LlmPort } from "../../domain/ideation/ports/llm-port";

export interface ValidationResult {
  isValid: boolean;
  reason: string;
}

export class ValidatePremiseUseCase {
  constructor(private readonly llmPort: LlmPort) {}

  async execute(premise: Premise): Promise<ValidationResult> {
    const prompt = `Critically analyze the following story premise for narrative conflict and stakes.
    
    Protagonist: ${premise.protagonist}
    Inciting Incident: ${premise.incitingIncident}
    Antagonist: ${premise.antagonist}
    Stakes: ${premise.stakes}
    
    Evaluate if there is a clear "Want vs Obstacle" dynamic and if the stakes are high and specific enough.
    
    Return the result as a JSON object with the following schema:
    {
      "isValid": boolean,
      "reason": "detailed string explaining why it is valid or what is missing"
    }
    No preamble, no explanation. Just the JSON object.`;

    const response = await this.llmPort.complete(prompt, { temperature: 0.3 });

    try {
      const data = JSON.parse(response.text);
      return {
        isValid: !!data.isValid,
        reason: data.reason || "No reason provided by LLM.",
      };
    } catch (error) {
      throw new Error("Failed to parse validation result from LLM");
    }
  }
}
