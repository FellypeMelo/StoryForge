import { describe, it, expect } from "vitest";
import { OceanProfile, OceanTraitScore } from "./ocean-profile";

describe("OceanProfile", () => {
  it("should create a profile with semantic scores", () => {
    const profile = OceanProfile.create({
      openness: OceanTraitScore.High,
      conscientiousness: OceanTraitScore.Medium,
      extraversion: OceanTraitScore.Low,
      agreeableness: OceanTraitScore.High,
      neuroticism: OceanTraitScore.Medium,
    });

    expect(profile.openness).toBe(OceanTraitScore.High);
    expect(profile.extraversion).toBe(OceanTraitScore.Low);
  });

  it("should identify 'Obsessive Perfectionist' as fatal flaw", () => {
    // High Conscientiousness + High Neuroticism
    const profile = OceanProfile.create({
      openness: OceanTraitScore.Medium,
      conscientiousness: OceanTraitScore.High,
      extraversion: OceanTraitScore.Medium,
      agreeableness: OceanTraitScore.Medium,
      neuroticism: OceanTraitScore.High,
    });

    expect(profile.getFatalFlaw()).toBe("Obsessive Perfectionist");
  });

  it("should identify 'Naive Idealist' as fatal flaw", () => {
    // High Openness + High Agreeableness + Low Conscientiousness
    const profile = OceanProfile.create({
      openness: OceanTraitScore.High,
      conscientiousness: OceanTraitScore.Low,
      extraversion: OceanTraitScore.Medium,
      agreeableness: OceanTraitScore.High,
      neuroticism: OceanTraitScore.Low,
    });

    expect(profile.getFatalFlaw()).toBe("Naive Idealist");
  });

  it("should return 'None' if no specific fatal flaw pattern matches", () => {
    const profile = OceanProfile.create({
      openness: OceanTraitScore.Medium,
      conscientiousness: OceanTraitScore.Medium,
      extraversion: OceanTraitScore.Medium,
      agreeableness: OceanTraitScore.Medium,
      neuroticism: OceanTraitScore.Medium,
    });

    expect(profile.getFatalFlaw()).toBe("None");
  });
});
