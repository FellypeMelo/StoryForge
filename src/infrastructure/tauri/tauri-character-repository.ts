import { invoke } from "@tauri-apps/api/core";
import { CharacterRepository } from "../../domain/ports/character-repository";
import { CharacterSheet } from "../../domain/character-sheet";
import { Result, DomainError } from "../../domain/result";
import { CharacterId } from "../../domain/value-objects/character-id";
import { ProjectId } from "../../domain/value-objects/project-id";
import { OceanProfile, OceanTraitScore } from "../../domain/ocean-profile";
import { HaugeArc } from "../../domain/hauge-arc";
import { VoiceProfile, PhysicalTells } from "../../domain/voice-profile";

interface TauriCharacterData {
  id: string;
  project_id: string;
  book_id?: string;
  name: string;
  age: number;
  occupation: string;
  physical_description: string;
  goal: string;
  motivation: string;
  internal_conflict: string;
  ocean_scores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  hauge_wound: string;
  hauge_belief: string;
  hauge_fear: string;
  hauge_identity: string;
  hauge_essence: string;
  voice_sentence_length: string;
  voice_formality: string;
  voice_verbal_tics: string;
  voice_evasion_mechanism: string;
  physical_tells: string;
}

export class TauriCharacterRepository implements CharacterRepository {
  async save(character: CharacterSheet): Promise<Result<void, DomainError>> {
    try {
      const data: TauriCharacterData = {
        id: character.id.value,
        project_id: character.projectId.value,
        name: character.name,
        ocean_scores: {
          openness: this.mapScoreToNumber(character.ocean.openness),
          conscientiousness: this.mapScoreToNumber(character.ocean.conscientiousness),
          extraversion: this.mapScoreToNumber(character.ocean.extraversion),
          agreeableness: this.mapScoreToNumber(character.ocean.agreeableness),
          neuroticism: this.mapScoreToNumber(character.ocean.neuroticism),
        },
        hauge_wound: character.hauge?.wound || "",
        hauge_belief: character.hauge?.belief || "",
        hauge_fear: character.hauge?.fear || "",
        hauge_identity: character.hauge?.identity || "",
        hauge_essence: character.hauge?.essence || "",
        voice_sentence_length: character.voice.sentenceLength,
        voice_formality: character.voice.formality,
        voice_verbal_tics: JSON.stringify(character.voice.verbalTics),
        voice_evasion_mechanism: character.voice.evasionMechanism,
        physical_tells: JSON.stringify(character.tells.list),
        // Default values for legacy fields
        age: 0,
        occupation: "",
        physical_description: "",
        goal: "",
        motivation: "",
        internal_conflict: "",
      };

      await invoke("create_character", { character: data });
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DomainError(String(error)) };
    }
  }

  async findById(id: CharacterId): Promise<Result<CharacterSheet, DomainError>> {
    try {
      const data = await invoke<TauriCharacterData>("get_character", { id: id.value });
      return { success: true, data: this.mapToSheet(data) };
    } catch (error) {
      return { success: false, error: new DomainError(String(error)) };
    }
  }

  async findByProject(projectId: ProjectId): Promise<Result<CharacterSheet[], DomainError>> {
    try {
      const data = await invoke<TauriCharacterData[]>("list_characters", { projectId: projectId.value });
      return { success: true, data: data.map(d => this.mapToSheet(d)) };
    } catch (error) {
      return { success: false, error: new DomainError(String(error)) };
    }
  }

  async delete(id: CharacterId): Promise<Result<void, DomainError>> {
    try {
      await invoke("delete_character", { id: id.value });
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DomainError(String(error)) };
    }
  }

  private mapScoreToNumber(score: OceanTraitScore): number {
    switch (score) {
      case OceanTraitScore.High: return 80;
      case OceanTraitScore.Medium: return 50;
      case OceanTraitScore.Low: return 20;
      default: return 50;
    }
  }

  private mapNumberToScore(score: number): OceanTraitScore {
    if (score >= 70) return OceanTraitScore.High;
    if (score <= 30) return OceanTraitScore.Low;
    return OceanTraitScore.Medium;
  }

  private mapToSheet(data: TauriCharacterData): CharacterSheet {
    const ocean = OceanProfile.create({
      openness: this.mapNumberToScore(data.ocean_scores.openness),
      conscientiousness: this.mapNumberToScore(data.ocean_scores.conscientiousness),
      extraversion: this.mapNumberToScore(data.ocean_scores.extraversion),
      agreeableness: this.mapNumberToScore(data.ocean_scores.agreeableness),
      neuroticism: this.mapNumberToScore(data.ocean_scores.neuroticism),
    });

    const hauge = data.hauge_identity ? HaugeArc.create({
      wound: data.hauge_wound,
      belief: data.hauge_belief,
      fear: data.hauge_fear,
      identity: data.hauge_identity,
      essence: data.hauge_essence,
    }) : undefined;

    const voice = VoiceProfile.create({
      sentenceLength: data.voice_sentence_length,
      formality: data.voice_formality,
      verbalTics: JSON.parse(data.voice_verbal_tics || "[]"),
      evasionMechanism: data.voice_evasion_mechanism,
    });

    const tells = PhysicalTells.create(JSON.parse(data.physical_tells || "[]"));

    return CharacterSheet.create({
      id: CharacterId.create(data.id),
      projectId: ProjectId.create(data.project_id),
      name: data.name,
      ocean,
      hauge,
      voice,
      tells,
    });
  }
}
