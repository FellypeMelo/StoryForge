export interface EmbeddingConfigProps {
  enabled: boolean;
  baseUrl: string;
  model: string;
}

/**
 * A baseUrl is only meaningful once embeddings are enabled — an inert
 * config with an empty baseUrl is a valid "off" state, but an enabled
 * one without a target server is a configuration error, not a runtime one.
 */
export class EmbeddingConfig {
  public readonly enabled: boolean;
  public readonly baseUrl: string;
  public readonly model: string;

  private constructor(props: EmbeddingConfigProps) {
    this.enabled = props.enabled;
    this.baseUrl = props.baseUrl;
    this.model = props.model;
  }

  public static create(props: EmbeddingConfigProps): EmbeddingConfig {
    if (props.enabled && !props.baseUrl.trim()) {
      throw new Error("baseUrl não pode estar vazio quando o embedding está habilitado");
    }
    return new EmbeddingConfig(props);
  }
}
