import { CompletionRequest } from './completion.model';

export interface OpenAICompletionRequest extends CompletionRequest {
  reasoning_effort?: 'low' | 'medium' | 'high';
  max_completion_tokens?: number;
}
