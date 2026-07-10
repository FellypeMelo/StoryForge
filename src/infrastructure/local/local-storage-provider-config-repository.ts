import { Result } from "../../domain/result";
import {
  ProviderConfig,
  ProviderConfigRepository,
} from "../../domain/ports/provider-config-repository";

const STORAGE_KEY = "storyforge_provider_configs";

export class LocalStorageProviderConfigRepository implements ProviderConfigRepository {
  async save(config: ProviderConfig): Promise<Result<void>> {
    const current = await this.listAll();
    if (!current.success) return current;

    const others = current.data.filter((c) => c.providerId !== config.providerId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...others, config]));
    return { success: true, data: undefined };
  }

  async listAll(): Promise<Result<ProviderConfig[]>> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { success: true, data: [] };

    try {
      return { success: true, data: JSON.parse(raw) as ProviderConfig[] };
    } catch {
      return {
        success: false,
        error: new Error("Configuração de provedores corrompida no armazenamento local"),
      };
    }
  }

  async findByProvider(id: string): Promise<Result<ProviderConfig | null>> {
    const all = await this.listAll();
    if (!all.success) return all;

    return { success: true, data: all.data.find((c) => c.providerId === id) ?? null };
  }
}
