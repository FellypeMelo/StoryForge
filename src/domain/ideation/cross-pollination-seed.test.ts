import { describe, it, expect } from 'vitest';
import { CrossPollinationSeed } from './cross-pollination-seed';
import { Genre } from '../value-objects/genre';
import { AcademicDiscipline } from '../value-objects/academic-discipline';

describe('CrossPollinationSeed Entity', () => {
  it('should create a valid seed', () => {
    const genre = Genre.create('Cyberpunk');
    const discipline = AcademicDiscipline.create('Quantum Physics');
    const seed = new CrossPollinationSeed(genre, discipline);
    expect(seed.genre.value).toBe('Cyberpunk');
    expect(seed.academicDiscipline.value).toBe('Quantum Physics');
  });
});
