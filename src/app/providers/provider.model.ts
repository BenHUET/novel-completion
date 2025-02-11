export interface ProviderResponse {
  text?: string;
  reasoning?: string;
}

export interface ProviderRequest {
  chat_completions?: boolean;
  prompt?: string;
  messages?: Message[];

  model?: string;

  stream?: boolean;

  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  repetition_penalty?: number;
  logit_bias?: Record<number, number>;
  top_logprobs?: number;
  min_p?: number;
  top_a?: number;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ProviderModel {
  id?: string;
  name?: string;
  max_context?: number;
}
