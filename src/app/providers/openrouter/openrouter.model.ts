import {
  CompletionRequest,
  CompletionResponse,
  ProviderModel,
} from '../provider.model';

export interface OpenRouterCompletionRequest extends CompletionRequest {
  provider?: {
    order?: string[];
    ignore?: string[];
    allow_fallbacks?: boolean;
  };
  include_reasoning?: boolean;
}

export interface OpenRouterCompletionResponse extends CompletionResponse {
  choices: (OpenRouterStreamingChoice | OpenRouterNonChatChoice)[];
}

export interface OpenRouterNonChatChoice {
  finish_reason: string | null;
  text: string;
  error?: OpenRouterErrorResponse;
}

export interface OpenRouterStreamingChoice {
  finish_reason: string | null;
  delta: {
    content?: string;
    reasoning?: string;
    role?: string;
  };
  error?: OpenRouterErrorResponse;
}

interface OpenRouterErrorResponse {
  code: number;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface OpenRouterModel extends ProviderModel {
  name: string;
  max_context: number;
}

export interface OpenRouterProvider {
  selected: boolean;
  provider_name: string;
  context_length: number;
  max_completion_tokens: number;
  pricing: {
    prompt: number;
    completion: number;
  };
  supported_parameters: string[];
}

export interface OpenRouterGeneration {
  id: string;
  total_cost: number;
}
