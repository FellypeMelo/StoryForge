import { LlmPort } from "../../domain/ideation/ports/llm-port";

export type ProseAction = "rewrite" | "expand" | "refine";

const ACTION_INSTRUCTIONS: Record<ProseAction, string> = {
  rewrite:
    "Reescreva o trecho a seguir com prosa visceral e concreta (método EPRL), preservando o sentido original. Mostre, não conte.",
  expand:
    "Expanda o trecho a seguir com detalhes sensoriais e ações físicas, mantendo o tom e o ponto de vista.",
  refine:
    "Refine o trecho a seguir: melhore ritmo e precisão, elimine clichês e AI-isms, sem alterar os eventos narrados.",
};

export class RefineProseUseCase {
  constructor(private readonly llmPort: LlmPort) {}

  async execute(action: ProseAction, text: string): Promise<string> {
    if (!text.trim()) {
      throw new Error("O texto para a ação não pode estar vazio");
    }
    const response = await this.llmPort.complete(buildPrompt(action, text), {
      temperature: 0.8,
      maxTokens: 1500,
    });
    return response.text.trim();
  }
}

function buildPrompt(action: ProseAction, text: string): string {
  return `${ACTION_INSTRUCTIONS[action]}\n\nTRECHO:\n${text}\n\nResponda apenas com o texto revisado, sem comentários ou marcações.`;
}
