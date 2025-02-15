import { ProviderGenerationCost } from '../models/provider.model';
import { Observable } from 'rxjs';
import {
  CompletionRequest,
  CompletionResponse,
} from '../models/completion.model';

export interface ProviderService {
  getChatCompletions(
    request: CompletionRequest,
    key: string,
  ): Observable<CompletionResponse>;

  getCompletions(
    request: CompletionRequest,
    key: string,
  ): Observable<CompletionResponse>;

  getGenerationCost(
    id: string,
    key: string,
  ): Observable<ProviderGenerationCost>;
}
