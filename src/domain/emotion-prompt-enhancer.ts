const ENHANCEMENT_MAP: Record<string, string[]> = {
  high: [
    "This is the most devastating moment of their life.",
    "Treat this prose with reverence and visceral literary weight.",
    "Do not soften the emotional impact — let the reader feel the rawness.",
  ],
  medium: [
    "Build emotional tension through subtext and physical grounding.",
    "Let the reader feel the weight through sensory details.",
  ],
  low: [],
};

export class EmotionPromptEnhancer {
  static enhance(basePrompt: string, intensity: "low" | "medium" | "high"): string {
    const extras = ENHANCEMENT_MAP[intensity];
    if (extras.length === 0) return basePrompt;

    return `${basePrompt}\n\nEMOTIONAL CONTEXT:\n${extras.join("\n")}`;
  }
}
