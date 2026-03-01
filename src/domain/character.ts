import { z } from 'zod';

export const OceanScoresSchema = z.object({
  openness: z.number().min(0).max(100).default(50),
  conscientiousness: z.number().min(0).max(100).default(50),
  extraversion: z.number().min(0).max(100).default(50),
  agreeableness: z.number().min(0).max(100).default(50),
  neuroticism: z.number().min(0).max(100).default(50),
});

export type OceanScores = z.infer<typeof OceanScoresSchema>;

export const CharacterSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)), // UUID preferred but flexible for initial mocks
  project_id: z.string().min(1),
  name: z.string().min(1, "Name cannot be empty"),
  age: z.number().int().min(0).default(0),
  occupation: z.string().default(''),
  physical_description: z.string().default(''),
  goal: z.string().default(''),
  motivation: z.string().default(''),
  internal_conflict: z.string().default(''),
  ocean_scores: OceanScoresSchema.default(() => ({
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
  })),
  voice: z.string().default(''),
  mannerisms: z.string().default(''),
});

export type Character = z.infer<typeof CharacterSchema>;
