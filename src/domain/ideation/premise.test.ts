import { describe, it, expect } from 'vitest';
import { Premise } from './premise';

describe('Premise Entity', () => {
  it('should create a valid premise', () => {
    const premise = new Premise(
      'A brave knight',
      'The dragon returns',
      'The dragon',
      'The safety of the village and the lives of his family'
    );
    expect(premise.protagonist).toBe('A brave knight');
    expect(premise.antagonist).toBe('The dragon');
  });

  it('should throw error if antagonist is empty', () => {
    expect(() => {
      new Premise(
        'A brave knight',
        'The dragon returns',
        '',
        'The village safety'
      );
    }).toThrow('Antagonist cannot be empty');
  });

  it('should throw error if stakes are too vague', () => {
    expect(() => {
      new Premise(
        'A brave knight',
        'The dragon returns',
        'The dragon',
        'Save world'
      );
    }).toThrow('Stakes are too vague');
  });

  it('should throw error if stakes are empty', () => {
    expect(() => {
      new Premise(
        'A brave knight',
        'The dragon returns',
        'The dragon',
        '   '
      );
    }).toThrow('Stakes cannot be empty');
  });
});
