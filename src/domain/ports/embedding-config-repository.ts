import { Result } from "../result";
import { EmbeddingConfig, EmbeddingConfigProps } from "../embedding-config";

export interface EmbeddingConfigRepository {
  load(): Promise<Result<EmbeddingConfig>>;
  save(config: EmbeddingConfigProps): Promise<Result<void>>;
}
