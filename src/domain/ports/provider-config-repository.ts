import { Result } from "../result";

export interface ProviderConfig {
  providerId: "ollama" | "openai" | "anthropic" | "gemini" | "llamacpp";
  apiKey?: string;
  baseUrl?: string;
  defaultModel: string;
  isActive: boolean;
}

export interface ProviderConfigRepository {
  save(config: ProviderConfig): Promise<Result<void>>;
  listAll(): Promise<Result<ProviderConfig[]>>;
  findByProvider(id: string): Promise<Result<ProviderConfig | null>>;
}
