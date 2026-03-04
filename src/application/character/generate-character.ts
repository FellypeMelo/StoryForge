import { LlmPort } from "../../domain/ideation/ports/llm-port";
import { Premise } from "../../domain/ideation/premise";
import { CharacterSheet } from "../../domain/character-sheet";
import { OceanProfile, OceanTraitScore } from "../../domain/ocean-profile";
import { HaugeArc } from "../../domain/hauge-arc";
import { VoiceProfile, PhysicalTells } from "../../domain/voice-profile";

export class GenerateCharacterUseCase {
  constructor(private readonly llmPort: LlmPort) {}

  async execute(premise: Premise, role: string): Promise<CharacterSheet> {
    const prompt = `Context: You are a professional character architect.
Role: Character Generator.
Knowledge: You use the OCEAN psychological profile and Michael Hauge's character arc framework.
Output: A deep character sheet in JSON format.

Premise:
- Protagonist: ${premise.protagonist}
- Inciting Incident: ${premise.incitingIncident}
- Antagonist: ${premise.antagonist}
- Stakes: ${premise.stakes}

Requested Role: ${role}

Generate a character following this schema:
{
  "ocean": {
    "openness": "Low|Medium|High",
    "conscientiousness": "Low|Medium|High",
    "extraversion": "Low|Medium|High",
    "agreeableness": "Low|Medium|High",
    "neuroticism": "Low|Medium|High"
  },
  "hauge": {
    "wound": "string",
    "belief": "string",
    "fear": "string",
    "identity": "string",
    "essence": "string"
  },
  "voice": {
    "sentenceLength": "string",
    "formality": "string",
    "verbalTics": ["string"],
    "evasionMechanism": "string"
  },
  "tells": ["string (exactly 3)"]
}

No preamble, no explanation. Just the JSON object.`;

    const response = await this.llmPort.complete(prompt, { temperature: 0.7 });

    try {
      const data = JSON.parse(response.text);

      const ocean = OceanProfile.create({
        openness: data.ocean.openness as OceanTraitScore,
        conscientiousness: data.ocean.conscientiousness as OceanTraitScore,
        extraversion: data.ocean.extraversion as OceanTraitScore,
        agreeableness: data.ocean.agreeableness as OceanTraitScore,
        neuroticism: data.ocean.neuroticism as OceanTraitScore,
      });

      const hauge = HaugeArc.create({
        wound: data.hauge.wound,
        belief: data.hauge.belief,
        fear: data.hauge.fear,
        identity: data.hauge.identity,
        essence: data.hauge.essence,
      });

      const voice = VoiceProfile.create({
        sentenceLength: data.voice.sentenceLength,
        formality: data.voice.formality,
        verbalTics: data.voice.verbalTics,
        evasionMechanism: data.voice.evasionMechanism,
      });

      const tells = PhysicalTells.create(data.tells);

      return CharacterSheet.create({
        ocean,
        hauge,
        voice,
        tells,
      });
    } catch (error) {
      throw new Error("Failed to parse character from LLM");
    }
  }
}
