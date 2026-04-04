import {
  StructuralErrorDetector,
  StructuralError,
  ChapterData,
} from "../../domain/structural-errors";

export class DetectStructuralErrorsUseCase {
  execute(chapters: ChapterData[]): StructuralError[] {
    return StructuralErrorDetector.detect(chapters);
  }
}
