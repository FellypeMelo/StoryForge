import { UnreliableNarratorConfig } from "./unreliable-narrator-config";

export class UnreliableNarratorPromptEnhancer {
  public static enhance(basePrompt: string, config: UnreliableNarratorConfig): string {
    if (!config.isActive()) {
      return basePrompt;
    }

    const fragment = `NARRADOR NÃO-CONFIÁVEL:
- A NARRAÇÃO deve divergir da AÇÃO: o que o personagem sente ou pensa ao narrar contradiz o que ele efetivamente faz.
- O narrador NUNCA reconhece que mente ou distorce os fatos — a autopercepção ("${config.selfPerception}") é apresentada como verdade absoluta.
- As pistas da distorção vêm exclusivamente da AÇÃO (gestos, escolhas, reações físicas), nunca de comentários da NARRAÇÃO.
- O contraste entre AÇÃO e NARRAÇÃO deve gerar desconforto crescente no leitor ao longo da cena.`;

    return basePrompt ? `${basePrompt}\n\n${fragment}` : fragment;
  }
}
