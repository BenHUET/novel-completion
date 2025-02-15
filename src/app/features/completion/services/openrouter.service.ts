import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProviderService } from './provider.service';
import {
  OpenRouterCompletionRequest,
  OpenRouterModel,
  OpenRouterProvider,
} from '../models/openrouter.model';
import { map, Observable, retry } from 'rxjs';
import {
  NonChatChoice,
  StreamingChoice,
  ProviderGenerationCost,
  ProviderModel,
  ProviderResponse,
} from '../models/provider.model';
import { getObservableEventSource } from '../helpers/eventsource.helper';
import { CompletionResponse } from '../models/completion.model';

@Injectable({
  providedIn: 'root',
})
export class OpenRouterService implements ProviderService {
  constructor(private http: HttpClient) {}

  getChatCompletions(
    request: OpenRouterCompletionRequest,
    key: string,
  ): Observable<CompletionResponse> {
    return getObservableEventSource<
      ProviderResponse,
      OpenRouterCompletionRequest
    >(
      request,
      key,
      '/openrouter/api/v1/chat/completions',
      (chunk, observer) => {
        const choice = chunk.choices[0] as StreamingChoice;
        observer.next({
          id: chunk.id,
          text: choice.delta.content,
          reasoning: choice.delta.reasoning,
        });
      },
    );
  }

  getCompletions(
    request: OpenRouterCompletionRequest,
    key: string,
  ): Observable<CompletionResponse> {
    return getObservableEventSource<
      ProviderResponse,
      OpenRouterCompletionRequest
    >(request, key, '/openrouter/api/v1/completions', (chunk, observer) => {
      const text = (chunk.choices[0] as NonChatChoice).text;
      if (text !== null)
        observer.next({
          text: (chunk.choices[0] as NonChatChoice).text,
        });
    });
  }

  getModels(): Observable<ProviderModel[]> {
    return this.http
      .get<{ data: OpenRouterModel[] }>('/openrouter/api/v1/models')
      .pipe<ProviderModel[]>(
        map((res) => {
          return res.data;
        }),
      );
  }

  getProviders(id: string): Observable<OpenRouterProvider[]> {
    return this.http
      .get<{
        data: {
          endpoints: OpenRouterProvider[];
        };
      }>('/openrouter/api/v1/models/' + id + '/endpoints')
      .pipe<OpenRouterProvider[]>(
        map((res) => {
          return res.data.endpoints.map((provider) => ({
            ...provider,
            selected: true,
          }));
        }),
      );
  }

  getGenerationCost(
    id: string,
    key: string,
  ): Observable<ProviderGenerationCost> {
    return this.http
      .get<{ data: ProviderGenerationCost }>(
        '/openrouter/api/v1/generation?id=' + id,
        {
          headers: {
            Authorization: 'Bearer ' + key,
            'Content-Type': 'application/json',
          },
        },
      )
      .pipe(retry(10))
      .pipe<ProviderGenerationCost>(
        map((res) => {
          return res.data;
        }),
      );
  }
}
