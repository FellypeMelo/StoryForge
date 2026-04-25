export interface BlacklistTerm {
  term: string;
  category:
    | "metaphor"
    | "generic-phrase"
    | "body-reaction"
    | "connector"
    | "clean-resolution";
  reason: string;
}

export class AiismBlacklist {
  public readonly terms: Set<BlacklistTerm>;

  private constructor(terms: Set<BlacklistTerm>) {
    this.terms = terms;
  }

  static default(): AiismBlacklist {
    const defaults: Omit<BlacklistTerm, "reason">[] = [
      // Metaphors
      { term: "rica tapeçaria", category: "metaphor" },
      { term: "mosaico de emoções", category: "metaphor" },
      { term: "dança mortal", category: "metaphor" },
      // Generic phrases
      { term: "silêncio ensurdecedor", category: "generic-phrase" },
      { term: "olhou para o horizonte", category: "generic-phrase" },
      // Body reactions
      { term: "apertou a mandíbula", category: "body-reaction" },
      { term: "arrepio na espinha", category: "body-reaction" },
      { term: "olhos brilharam", category: "body-reaction" },
      { term: "cerrou os punhos", category: "body-reaction" },
      // Connectors
      { term: "não apenas", category: "connector" },
      { term: "e então", category: "connector" },
      // Clean resolutions
      { term: "aprendeu uma lição", category: "clean-resolution" },
      { term: "entendeu finalmente", category: "clean-resolution" },
    ];

    const fullDefaults = defaults.map((t) => ({
      ...t,
      reason: `AI-ism detected in ${t.category} category`,
    }));

    return new AiismBlacklist(new Set(fullDefaults));
  }

  static empty(): AiismBlacklist {
    return new AiismBlacklist(new Set());
  }

  add(term: BlacklistTerm): AiismBlacklist {
    const copy = new Set(this.terms);
    copy.add(term);
    return new AiismBlacklist(copy);
  }

  getByCategory(category: BlacklistTerm["category"]): BlacklistTerm[] {
    return [...this.terms].filter((t) => t.category === category);
  }

  getAllTerms(): string[] {
    return [...this.terms].map((t) => t.term);
  }
}
