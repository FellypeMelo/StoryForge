export interface MruViolation {
  type: "tell" | "reaction-order";
  snippet: string;
  suggestion: string;
}

export interface MruScanResult {
  violations: MruViolation[];
}

const TELL_PATTERNS_PT = [
  { regex: /sentiu\s+(raiva|medo|tristeza|alegria|angústia|ódio|culpa|vergonha|pânico|desespero)/gi, suggestion: "Descreva a reação física ao invés de nomear a emoção. Ex: 'Seus dedos tremeram' ao invés de 'sentiu medo'." },
  { regex: /ficou\s+(triste|feliz|bravo|com raiva|com medo|nervoso|ansioso|desesperado)/gi, suggestion: "Mostre a emoção através de ações. Ex: 'Ele engoliu seco' ao invés de 'ficou com medo'." },
  { regex: /estava\s+(com medo|com raiva|com vergonha|furioso|apavorado|desolado)/gi, suggestion: "Use reações fisiológicas ao invés de estados. Ex: 'O coração disparou' ao invés de 'estava apavorado'." },
  { regex: /sentia\s+(raiva|medo|tristeza|alegria|angústia|ódio|culpa)/gi, suggestion: "Encene a emoção ao invés de narrá-la diretamente." },
];

const TELL_PATTERNS_EN = [
  { regex: /felt\s+(angry|sad|afraid|scared|happy|nervous|anxious|terrified|joy|fear|rage)/gi, suggestion: "Show the physical reaction instead of naming the emotion." },
  { regex: /\bwas\s+(angry|sad|afraid|scared|happy|nervous|anxious|terrified)/gi, suggestion: "Show the emotion through action, not direct statement." },
  { regex: /feeling\s+(anger|fear|sadness|joy|hope|despair)/gi, suggestion: "Replace emotion naming with physiological response." },
];

export class MruValidator {
  static scan(text: string): MruScanResult {
    const violations: MruViolation[] = [];

    for (const pattern of [...TELL_PATTERNS_PT, ...TELL_PATTERNS_EN]) {
      pattern.regex.lastIndex = 0;
      const match = pattern.regex.exec(text);
      if (match) {
        violations.push({
          type: "tell" as const,
          snippet: match[0],
          suggestion: pattern.suggestion,
        });
      }
    }

    return { violations };
  }
}
