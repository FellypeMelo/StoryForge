import { Genre } from '../../domain/value-objects/genre';
import { AcademicDiscipline } from '../../domain/value-objects/academic-discipline';
import { ExtractClichesUseCase } from './extract-cliches';
import { GeneratePremisesUseCase } from './generate-premises';
import { ValidatePremiseUseCase, ValidationResult } from './validate-premise';
import { Premise } from '../../domain/ideation/premise';
import { ClicheBlacklist } from '../../domain/ideation/cliche-blacklist';
import { CrossPollinationSeed } from '../../domain/ideation/cross-pollination-seed';

export interface PipelineResult {
  blacklist: ClicheBlacklist;
  premises: Premise[];
  validations: ValidationResult[];
}

export class IdeationPipeline {
  constructor(
    private readonly extractUseCase: ExtractClichesUseCase,
    private readonly generateUseCase: GeneratePremisesUseCase,
    private readonly validateUseCase: ValidatePremiseUseCase
  ) {}

  async run(genre: Genre, discipline: AcademicDiscipline): Promise<PipelineResult> {
    const blacklist = await this.extractUseCase.execute(genre);
    const seed = new CrossPollinationSeed(genre, discipline);
    const premises = await this.generateUseCase.execute(seed, blacklist);

    const validations = await Promise.all(
      premises.map((premise) => this.validateUseCase.execute(premise))
    );

    return {
      blacklist,
      premises,
      validations,
    };
  }
}
