import { Genre } from '../value-objects/genre';
import { AcademicDiscipline } from '../value-objects/academic-discipline';

export class CrossPollinationSeed {
  constructor(
    public readonly genre: Genre,
    public readonly academicDiscipline: AcademicDiscipline
  ) {}
}
