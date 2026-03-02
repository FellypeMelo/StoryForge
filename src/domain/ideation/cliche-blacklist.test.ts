import { describe, it, expect } from 'vitest';
import { ClicheBlacklist } from './cliche-blacklist';

describe('ClicheBlacklist Entity', () => {
  it('should create a valid blacklist', () => {
    const blacklist = new ClicheBlacklist('Fantasy', ['Chosen One', 'Dark Lord']);
    expect(blacklist.genre).toBe('Fantasy');
    expect(blacklist.bannedTerms).toContain('Chosen One');
  });

  it('should throw error if bannedTerms is empty', () => {
    expect(() => {
      new ClicheBlacklist('Sci-Fi', []);
    }).toThrow('Banned terms list cannot be empty');
  });
});
