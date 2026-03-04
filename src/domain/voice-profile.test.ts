import { describe, it, expect } from "vitest";
import { VoiceProfile, PhysicalTells } from "./voice-profile";

describe("VoiceProfile", () => {
  it("should create a valid VoiceProfile", () => {
    const profile = VoiceProfile.create({
      sentenceLength: "Short",
      formality: "Formal",
      verbalTics: ["Actually", "Literally"],
      evasionMechanism: "Changing the subject",
    });

    expect(profile.sentenceLength).toBe("Short");
    expect(profile.formality).toBe("Formal");
    expect(profile.verbalTics).toContain("Literally");
    expect(profile.evasionMechanism).toBe("Changing the subject");
  });
});

describe("PhysicalTells", () => {
  it("should create valid PhysicalTells", () => {
    const tells = PhysicalTells.create([
      "Tapping fingers",
      "Avoiding eye contact",
      "Playing with hair",
    ]);

    expect(tells.list).toHaveLength(3);
    expect(tells.list).toContain("Tapping fingers");
  });

  it("should fail if less than 3 tells are provided", () => {
    expect(() => {
      PhysicalTells.create(["Tapping fingers"]);
    }).toThrow("At least 3 physical tells are required");
  });
});
