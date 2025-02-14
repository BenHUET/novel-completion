export interface CompletionResponse {
  id?: string;
  text?: string;
  reasoning?: string;
}

export interface CompletionRequest {
  chat_completions?: boolean;
  prompt?: string;
  messages?: Message[];
  model?: string;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  min_p?: number;
  top_a?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  repetition_penalty?: number;
  logit_bias?: Record<number, number>;
  top_logprobs?: number;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ProviderModel {
  id: string;
}

export enum CompletionCapability {
  temperature,
  max_tokens,
  top_p,
  top_k,
  top_a,
  min_p,
  frequence_penalty,
  presence_penalty,
  repetition_penalty,
  logit_bias,
  top_logprobs,
}
