import { describe, it, expect, vi, beforeEach } from "vitest";
import { IdeationPipeline } from "./ideation-pipeline";
import { Genre } from "../../domain/value-objects/genre";
import { AcademicDiscipline } from "../../domain/value-objects/academic-discipline";
import { ExtractClichesUseCase } from "./extract-cliches";
import { GeneratePremisesUseCase } from "./generate-premises";
import { ValidatePremiseUseCase } from "./validate-premise";
import { Premise } from "../../domain/ideation/premise";
import { ClicheBlacklist } from "../../domain/ideation/cliche-blacklist";
import { ProjectId } from "../../domain/value-objects/project-id";

describe("IdeationPipeline", () => {
  let extractUseCase: ExtractClichesUseCase;
  let generateUseCase: GeneratePremisesUseCase;
  let validateUseCase: ValidatePremiseUseCase;
  let pipeline: IdeationPipeline;

  beforeEach(() => {
    extractUseCase = { execute: vi.fn() } as any;
    generateUseCase = { execute: vi.fn() } as any;
    validateUseCase = { execute: vi.fn() } as any;
    pipeline = new IdeationPipeline(extractUseCase, generateUseCase, validateUseCase);
  });

  it("should execute the 3-phase CHI pipeline", async () => {
    const projectId = ProjectId.generate();
    const genre = Genre.create("Fantasy");
    const discipline = AcademicDiscipline.create("Physics");

    const mockBlacklist = new ClicheBlacklist(genre, ["Cliche 1"]);
    const mockPremises = [
      new Premise("P1", "I1", "A1", "Stakes are high enough"),
      new Premise("P2", "I2", "A2", "Stakes are also high enough"),
    ];
    const mockValidation = { isValid: true, reason: "Good" };

    vi.mocked(extractUseCase.execute).mockResolvedValue(mockBlacklist);
    vi.mocked(generateUseCase.execute).mockResolvedValue(mockPremises);
    vi.mocked(validateUseCase.execute).mockResolvedValue(mockValidation);

    const result = await pipeline.run(projectId, genre, discipline);

    expect(extractUseCase.execute).toHaveBeenCalledWith(genre, projectId);
    expect(generateUseCase.execute).toHaveBeenCalled();
    expect(validateUseCase.execute).toHaveBeenCalled();
    expect(result.premises).toHaveLength(2);
    expect(result.blacklist).toBe(mockBlacklist);
  });
});
