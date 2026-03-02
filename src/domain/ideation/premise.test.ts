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

  it('should throw error if antagonist is null or undefined', () => {
    expect(() => {
      new Premise('P', 'I', null as any, 'Stakes must be long enough');
    }).toThrow('Antagonist cannot be empty');
    expect(() => {
      new Premise('P', 'I', undefined as any, 'Stakes must be long enough');
    }).toThrow('Antagonist cannot be empty');
  });

  it('should throw error if antagonist is empty or whitespace', () => {
    expect(() => {
      new Premise('P', 'I', '', 'Stakes must be long enough');
    }).toThrow('Antagonist cannot be empty');
    expect(() => {
      new Premise('P', 'I', '   ', 'Stakes must be long enough');
    }).toThrow('Antagonist cannot be empty');
  });

  it('should throw error if stakes are null or undefined', () => {
    expect(() => {
      new Premise('P', 'I', 'A', null as any);
    }).toThrow('Stakes cannot be empty');
    expect(() => {
      new Premise('P', 'I', 'A', undefined as any);
    }).toThrow('Stakes cannot be empty');
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

  it('should throw error if stakes are empty or whitespace', () => {
    expect(() => {
      new Premise('P', 'I', 'A', '');
    }).toThrow('Stakes cannot be empty');
    expect(() => {
      new Premise('P', 'I', 'A', '   ');
    }).toThrow('Stakes cannot be empty');
  });
});
