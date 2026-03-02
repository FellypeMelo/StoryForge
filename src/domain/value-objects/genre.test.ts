import { describe, it, expect } from 'vitest';
import { Genre } from './genre';

describe('Genre Value Object', () => {
  it('should create a valid genre', () => {
    const genre = Genre.create('Fantasy');
    expect(genre.value).toBe('Fantasy');
  });

  it('should throw error if genre is empty', () => {
    expect(() => Genre.create('')).toThrow('Genre cannot be empty');
  });

  it('should throw error if genre is too short', () => {
    expect(() => Genre.create('F')).toThrow('Genre must be at least 2 characters');
  });
});
