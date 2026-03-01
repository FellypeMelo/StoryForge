import { describe, it, expect } from 'vitest';
import { CharacterSchema } from './character';

describe('CharacterSchema', () => {
  it('should fail validation for empty name', () => {
    const result = CharacterSchema.safeParse({
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('should fail if required fields are missing (age, ocean_scores, etc)', () => {
    // Current minimal schema only has name, so this will pass safely but fail 
    // when we add required fields.
    const result = CharacterSchema.safeParse({
      name: 'Protagonist'
    });
    expect(result.success).toBe(false);
  });

  it('should pass for valid data with all fields', () => {
    const validData = {
      id: 'char-123',
      project_id: 'proj-123',
      name: 'Protagonist',
      age: 25,
      occupation: 'Hero',
      physical_description: 'Tall',
      goal: 'Win',
      motivation: 'Justice',
      internal_conflict: 'Fear',
      ocean_scores: {
        openness: 80,
        conscientiousness: 70,
        extraversion: 60,
        agreeableness: 90,
        neuroticism: 20,
      },
      voice: 'Confident',
      mannerisms: 'Fast talker'
    };
    const result = CharacterSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
        expect(result.data.age).toBe(25);
        expect(result.data.ocean_scores.openness).toBe(80);
    }
  });
});
