export interface LlmOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface LlmResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LlmPort {
  complete(prompt: string, options?: LlmOptions): Promise<LlmResponse>;
}
