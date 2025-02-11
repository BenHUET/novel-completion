import {
  ProviderGeneration,
  ProviderRequest,
  ProviderResponse,
} from './provider.model';
import { Observable } from 'rxjs';

export interface ProviderService {
  getChatCompletions(
    request: ProviderRequest,
    key: string,
  ): Observable<ProviderResponse>;

  getCompletions(
    request: ProviderRequest,
    key: string,
  ): Observable<ProviderResponse>;

  getGenerationCost(id: string, key: string): Observable<ProviderGeneration>;
}
