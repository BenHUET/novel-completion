export interface ProviderModel {
  id: string;
}

export interface ProviderGenerationCost {
  id: string;
  total_cost: number;
}

export interface ProviderResponse {
  id?: string;
  choices: (StreamingChoice | NonChatChoice)[];
}

export interface NonChatChoice {
  finish_reason: string | null;
  text: string;
  error?: ErrorResponse;
}

export interface StreamingChoice {
  finish_reason: string | null;
  delta: {
    content?: string;
    reasoning?: string;
    role?: string;
  };
  error?: ErrorResponse;
}

interface ErrorResponse {
  code: number;
  message: string;
  metadata?: Record<string, unknown>;
}
