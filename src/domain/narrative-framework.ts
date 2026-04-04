/**
 * NarrativeFramework value object with beat definitions for each of the 6 frameworks.
 * Strategy pattern: each framework defines its own beat structure via BEATS_MAP.
 */
export class NarrativeFramework {
  private constructor(
    public readonly value: string,
    public readonly name: string,
  ) {}

  static HeroesJourney() {
    return new NarrativeFramework("heroes-journey", "Jornada do Heroi");
  }
  static SaveTheCat() {
    return new NarrativeFramework("save-the-cat", "Save the Cat");
  }
  static Fichteana() {
    return new NarrativeFramework("fichteana", "Curva Fichteana");
  }
  static SevenPoint() {
    return new NarrativeFramework("seven-point", "Estrutura de 7 Pontos");
  }
  static Kishotenketsu() {
    return new NarrativeFramework("kishotenketsu", "Kishotenketsu");
  }
  static NonLinear() {
    return new NarrativeFramework("non-linear", "Não-linear");
  }

  static all(): NarrativeFramework[] {
    return [
      this.HeroesJourney(),
      this.SaveTheCat(),
      this.Fichteana(),
      this.SevenPoint(),
      this.Kishotenketsu(),
      this.NonLinear(),
    ];
  }

  static fromValue(value: string): NarrativeFramework | null {
    return this.all().find((f) => f.value === value) ?? null;
  }
}

export const BEATS_MAP: Record<string, string[]> = {
  // 1. Hero's Journey — 12 stages
  "Jornada do Heroi": [
    "Mundo Comum",
    "Chamado à Aventura",
    "Recusa do Chamado",
    "Encontro com o Mentor",
    "Travessia do Primeiro Limiar",
    "Testes, Aliados e Inimigos",
    "Aproximação da Caverna Oculta",
    "Provação Suprema (Ordeal)",
    "Recompensa",
    "O Caminho de Volta",
    "Ressurreição",
    "Retorno com o Elixir",
  ],
  // 2. Save the Cat — 15 beats
  "Save the Cat": [
    "Imagem de Abertura",
    "Tema Enunciado",
    "Setup",
    "Catalisador",
    "Debate",
    "Entrada no Ato 2",
    "B Story (Relacionamentos)",
    "Diversão e Jogos",
    "Ponto Central",
    "Forças Internas se Aproximam",
    "Tudo Está Perdido",
    "Noite Escura da Alma",
    "Entrada no Ato 3",
    "Finale",
    "Imagem Final",
  ],
  // 3. Fichte Curve — 8 crises
  "Curva Fichteana": [
    "Crise 1: Introdução do Conflito",
    "Crise 2: Primeiro Obstáculo Real",
    "Crise 3: Escalada de Tensão",
    "Crise 4: Ponto Sem Retorno",
    "Crise 5: O Golpe Mais Forte",
    "Crise 6: Desmoronamento",
    "Crise 7: Última Tentativa",
    "Crise 8: Resolução Final",
  ],
  // 4. Seven Point Structure
  "Estrutura de 7 Pontos": [
    "Gancho (Hook)",
    "Virada Plot 1",
    "Pinch Point 1",
    "Midpoint",
    "Pinch Point 2",
    "Virada Plot 2",
    "Resolução",
  ],
  // 5. Kishōtenketsu — 4 acts
  Kishotenketsu: [
    "Ki (Introdução)",
    "Shō (Desenvolvimento)",
    "Ten (Twist/Surpresa)",
    "Ketsu (Conclusão/Reconciliação)",
  ],
  // 6. Non-linear — 6 temporal markers
  "Não-linear": [
    "Marcador Temporal Inicial",
    "Flashback / Origem",
    "Salto ao Presente",
    "Ponto de Convergência",
    "Flashforward / Consequência Futura",
    "Reconciliação Temporal",
  ],
};
