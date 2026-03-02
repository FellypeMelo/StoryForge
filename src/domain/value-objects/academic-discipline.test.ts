import { describe, it, expect } from 'vitest';
import { AcademicDiscipline } from './academic-discipline';

describe('AcademicDiscipline Value Object', () => {
  it('should create a valid discipline', () => {
    const discipline = AcademicDiscipline.create('Physics');
    expect(discipline.value).toBe('Physics');
  });

  it('should throw error if discipline is empty', () => {
    expect(() => AcademicDiscipline.create('')).toThrow('Academic discipline cannot be empty');
  });
});
