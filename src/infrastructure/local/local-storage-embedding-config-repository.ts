import { Result } from "../../domain/result";
import { EmbeddingConfig, EmbeddingConfigProps } from "../../domain/embedding-config";
import { EmbeddingConfigRepository } from "../../domain/ports/embedding-config-repository";

const STORAGE_KEY = "storyforge_embedding_config";

const DEFAULT_CONFIG: EmbeddingConfigProps = {
  enabled: false,
  baseUrl: "http://127.0.0.1:8080",
  model: "",
};

export class LocalStorageEmbeddingConfigRepository implements EmbeddingConfigRepository {
  async load(): Promise<Result<EmbeddingConfig>> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { success: true, data: EmbeddingConfig.create(DEFAULT_CONFIG) };

    try {
      const parsed = JSON.parse(raw) as EmbeddingConfigProps;
      return { success: true, data: EmbeddingConfig.create(parsed) };
    } catch {
      return {
        success: false,
        error: new Error("Configuração de embedding corrompida no armazenamento local"),
      };
    }
  }

  async save(config: EmbeddingConfigProps): Promise<Result<void>> {
    try {
      const validated = EmbeddingConfig.create(config);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          enabled: validated.enabled,
          baseUrl: validated.baseUrl,
          model: validated.model,
        }),
      );
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}
