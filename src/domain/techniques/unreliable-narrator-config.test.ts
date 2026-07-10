import { describe, it, expect } from "vitest";
import { UnreliableNarratorConfig } from "./unreliable-narrator-config";

describe("UnreliableNarratorConfig", () => {
  it("creates a valid config", () => {
    const config = UnreliableNarratorConfig.create({
      highNeuroticism: true,
      dissonance: true,
      selfPerception: "Acredita que é a única pessoa racional na sala",
    });

    expect(config.highNeuroticism).toBe(true);
    expect(config.dissonance).toBe(true);
    expect(config.selfPerception).toBe("Acredita que é a única pessoa racional na sala");
  });

  it("throws when selfPerception is empty", () => {
    expect(() =>
      UnreliableNarratorConfig.create({
        highNeuroticism: true,
        dissonance: true,
        selfPerception: "   ",
      }),
    ).toThrow();
  });

  describe("isActive", () => {
    it("is active when highNeuroticism and dissonance are both true", () => {
      const config = UnreliableNarratorConfig.create({
        highNeuroticism: true,
        dissonance: true,
        selfPerception: "Se vê como a vítima em todas as situações",
      });

      expect(config.isActive()).toBe(true);
    });

    it("is inactive when only highNeuroticism is true", () => {
      const config = UnreliableNarratorConfig.create({
        highNeuroticism: true,
        dissonance: false,
        selfPerception: "Se vê como a vítima em todas as situações",
      });

      expect(config.isActive()).toBe(false);
    });

    it("is inactive when only dissonance is true", () => {
      const config = UnreliableNarratorConfig.create({
        highNeuroticism: false,
        dissonance: true,
        selfPerception: "Se vê como a vítima em todas as situações",
      });

      expect(config.isActive()).toBe(false);
    });

    it("is inactive when neither flag is set", () => {
      const config = UnreliableNarratorConfig.create({
        highNeuroticism: false,
        dissonance: false,
        selfPerception: "Se vê como a vítima em todas as situações",
      });

      expect(config.isActive()).toBe(false);
    });
  });
});
