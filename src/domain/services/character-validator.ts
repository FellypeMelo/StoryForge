import { CharacterSheet } from "../character-sheet";
import { OceanTraitScore } from "../ocean-profile";

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
}

export class CharacterValidator {
  public static validate(sheet: CharacterSheet): ValidationResult {
    const warnings: string[] = [];

    // Mary Sue Detection
    const ocean = sheet.ocean;
    if (
      ocean.openness === OceanTraitScore.High &&
      ocean.conscientiousness === OceanTraitScore.High &&
      ocean.extraversion === OceanTraitScore.High &&
      ocean.agreeableness === OceanTraitScore.High &&
      ocean.neuroticism === OceanTraitScore.Low
    ) {
      warnings.push("Anti-pattern detected: 'Mary Sue' (Too perfect OCEAN profile)");
    }

    // Generic Voice Detection
    const voice = sheet.voice;
    if (
      voice.verbalTics.length === 0 &&
      voice.formality.toLowerCase() === "neutral" &&
      voice.evasionMechanism.toLowerCase() === "none"
    ) {
      warnings.push("Warning: Character voice profile is generic");
    }

    return {
      isValid: true, // We still allow it but with warnings
      warnings,
    };
  }
}
