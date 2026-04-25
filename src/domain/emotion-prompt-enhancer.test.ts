import { describe, it, expect } from "vitest";
import { EmotionPromptEnhancer } from "./emotion-prompt-enhancer";

describe("EmotionPromptEnhancer", () => {
  it("enhances high intensity beats", () => {
    const base = "Write a scene about a funeral.";
    const enhanced = EmotionPromptEnhancer.enhance(base, "high");
    expect(enhanced).toContain("funeral");
    expect(enhanced).toContain("devastating");
    expect(enhanced).not.toEqual(base);
  });

  it("enhances medium intensity beats with moderate urgency", () => {
    const base = "Write a scene about a conversation.";
    const enhanced = EmotionPromptEnhancer.enhance(base, "medium");
    expect(enhanced).toContain("conversation");
    expect(enhanced).not.toEqual(base);
  });

  it("does not modify low intensity beats", () => {
    const base = "Write a scene about a walk in the park.";
    const enhanced = EmotionPromptEnhancer.enhance(base, "low");
    expect(enhanced).toBe(base);
  });
});
