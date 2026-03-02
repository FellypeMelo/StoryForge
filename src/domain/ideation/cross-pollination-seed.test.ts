import { describe, it, expect } from 'vitest';
import { CrossPollinationSeed } from './cross-pollination-seed';

describe('CrossPollinationSeed Entity', () => {
  it('should create a valid seed', () => {
    const seed = new CrossPollinationSeed('Cyberpunk', 'Quantum Physics');
    expect(seed.genre).toBe('Cyberpunk');
    expect(seed.academicDiscipline).toBe('Quantum Physics');
  });

  it('should throw error if academicDiscipline is empty', () => {
    expect(() => {
      new CrossPollinationSeed('Horror', '');
    }).toThrow('Academic discipline cannot be empty');
  });
});
