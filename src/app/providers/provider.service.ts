import { CompletionRequest, CompletionResponse } from './provider.model';
import { Observable } from 'rxjs';

export interface ProviderService {
  getChatCompletions(
    request: CompletionRequest,
    key: string,
  ): Observable<CompletionResponse>;

  getCompletions(
    request: CompletionRequest,
    key: string,
  ): Observable<CompletionResponse>;
}
