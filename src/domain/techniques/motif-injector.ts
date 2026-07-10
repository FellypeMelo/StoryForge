import { MotifDefinition } from "./motif-definition";

// Below this intensity the motif is too faint to be worth surfacing in the prompt.
const INJECTION_THRESHOLD = 0.15;

export class MotifInjector {
  public static inject(basePrompt: string, motif: MotifDefinition, progress: number): string {
    const intensity = motif.frequencyAt(progress);
    if (intensity < INJECTION_THRESHOLD) {
      return basePrompt;
    }

    const intensityPct = Math.round(intensity * 100);
    const fragment = `MOTIVO SIMBÓLICO (intensidade ${intensityPct}%):
- O símbolo "${motif.object}" deve aparecer na PERIFERIA do ambiente — nunca no centro da ação.
- NUNCA explique o significado do símbolo diretamente; ele permanece implícito para o leitor.
- Sua frequência e proeminência devem escalar conforme a intensidade (${intensityPct}%), ecoando a ferida: ${motif.associatedWound}.`;

    return basePrompt ? `${basePrompt}\n\n${fragment}` : fragment;
  }
}
