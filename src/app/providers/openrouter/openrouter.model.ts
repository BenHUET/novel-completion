import {ProviderModel, ProviderRequest} from '../provider.model';

export interface OpenRouterRequest extends ProviderRequest {
  response_format?: { type: 'json_object' };
  stop?: string | string[];

  provider?: {
    order?: string[];
    ignore?: string[];
    allow_fallbacks?: boolean;
  };
  include_reasoning?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  choices: (NonStreamingChoice | StreamingChoice | NonChatChoice)[];
  created: number;
  model: string;
  object: "chat.completion" | "chat.completion.chunk";
  system_fingerprint?: string;
  usage?: ResponseUsage;
}

interface ResponseUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface NonChatChoice {
  finish_reason: string | null;
  text: string;
  error?: ErrorResponse;
}

export interface NonStreamingChoice {
  finish_reason: string | null;
  message: {
    content: string | null;
    role: string;
    tool_calls?: ToolCall[];
  };
  error?: ErrorResponse;
}

export interface StreamingChoice {
  finish_reason: string | null;
  delta: {
    content?: string;
    reasoning?: string;
    role?: string;
    tool_calls?: ToolCall[];
  };
  error?: ErrorResponse;
}

interface ErrorResponse {
  code: number;
  message: string;
  metadata?: Record<string, unknown>;
}

interface ToolCall {
  id: string;
  type: "function";
  function: unknown;
}

export interface OpenRouterModelsResponse {
  data: ProviderModel[]
}

export interface OpenRouterModelProvidersResponse {
  data: {
    endpoints: OpenRouterProvider[]
  }
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
