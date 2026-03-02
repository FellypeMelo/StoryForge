import { describe, it, expect } from 'vitest';
import { Genre } from './genre';

describe('Genre Value Object', () => {
  it('should create a valid genre', () => {
    const genre = Genre.create('Fantasy');
    expect(genre.value).toBe('Fantasy');
  });

  it('should trim whitespace from genre name', () => {
    const genre = Genre.create('  Sci-Fi  ');
    expect(genre.value).toBe('Sci-Fi');
  });

  it('should throw error if genre is empty', () => {
    expect(() => Genre.create('')).toThrow('Genre cannot be empty');
  });

  it('should throw error if genre is only whitespace', () => {
    expect(() => Genre.create('   ')).toThrow('Genre cannot be empty');
  });

  it('should throw error if genre is too short', () => {
    expect(() => Genre.create('F')).toThrow('Genre must be at least 2 characters');
  });

  it('should throw error if value is null or undefined', () => {
    expect(() => Genre.create(null as any)).toThrow('Genre cannot be empty');
    expect(() => Genre.create(undefined as any)).toThrow('Genre cannot be empty');
  });
});
