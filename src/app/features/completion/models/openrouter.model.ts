import { ProviderModel } from './provider.model';
import { CompletionRequest } from './completion.model';

export interface OpenRouterCompletionRequest extends CompletionRequest {
  provider?: {
    order?: string[];
    ignore?: string[];
    allow_fallbacks?: boolean;
  };
  include_reasoning?: boolean;
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
