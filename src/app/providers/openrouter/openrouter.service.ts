import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProviderService } from '../provider.service';
import { EventSource } from 'eventsource';
import {
  NonChatChoice,
  OpenRouterGeneration,
  OpenRouterGenerationResponse,
  OpenRouterModelProvidersResponse,
  OpenRouterModelsResponse,
  OpenRouterProvider,
  OpenRouterRequest,
  OpenRouterResponse,
  StreamingChoice,
} from './openrouter.model';
import { map, Observable, retry, Subscriber } from 'rxjs';
import { ProviderModel, ProviderResponse } from '../provider.model';

@Injectable({
  providedIn: 'root',
})
export class OpenRouterService implements ProviderService {
  constructor(private http: HttpClient) {}

  getChatCompletions(
    request: OpenRouterRequest,
    key: string,
  ): Observable<ProviderResponse> {
    console.log(request);
    return this.getObservableEventSource(
      request,
      key,
      '/openrouter/api/v1/chat/completions',
      (chunk, observer) => {
        const choice = chunk.choices[0] as StreamingChoice;
        observer.next({
          id: chunk.id,
          text: choice.delta.content,
          reasoning: choice.delta.reasonin,
        });
      },
    );
  }

  getCompletions(
    request: OpenRouterRequest,
    key: string,
  ): Observable<ProviderResponse> {
    console.log(request);
    return this.getObservableEventSource(
      request,
      key,
      '/openrouter/api/v1/completions',
      (chunk, observer) => {
        const text = (chunk.choices[0] as NonChatChoice).text;
        if (text !== null)
          observer.next({ text: (chunk.choices[0] as NonChatChoice).text! });
      },
    );
  }

  getModels(): Observable<ProviderModel[]> {
    return this.http
      .get<OpenRouterModelsResponse>('/openrouter/api/v1/models')
      .pipe<ProviderModel[]>(
        map((res) => {
          return res.data;
        }),
      );
  }

  getProviders(id: string): Observable<OpenRouterProvider[]> {
    return this.http
      .get<OpenRouterModelProvidersResponse>(
        '/openrouter/api/v1/models/' + id + '/endpoints',
      )
      .pipe<OpenRouterProvider[]>(
        map((res) => {
          return res.data.endpoints.map((provider) => ({
            ...provider,
            selected: tru,
          }));
        }),
      );
  }

  getGenerationCost(id: string, key: string): Observable<OpenRouterGeneration> {
    return this.http
      .get<OpenRouterGenerationResponse>(
        '/openrouter/api/v1/generation?id=' + id,
        {
          headers: {
            Authorization: 'Bearer ' + key,
            'Content-Type': 'application/json',
          },
        },
      )
      .pipe(retry(10))
      .pipe<OpenRouterGeneration>(
        map((res) => {
          return res.data;
        }),
      );
  }

  private getObservableEventSource(
    request: OpenRouterRequest,
    key: string,
    url: string,
    onChunk: (
      chunk: OpenRouterResponse,
      observer: Subscriber<ProviderResponse>,
    ) => void,
  ): Observable<ProviderResponse> {
    return new Observable<ProviderResponse>((observer) => {
      const eventSource = new EventSource(url, {
        fetch: (input, init): Promise<Response> =>
          fetch(input, {
            ...init,
            method: 'POST',
            headers: {
              ...init!.headers,
              Authorization: 'Bearer ' + key,
              'Content-Type': 'application/jso',
            },
            body: JSON.stringify(request),
          }),
      });

      eventSource.onmessage = (event): void => {
        if (event.data === '[DONE]') {
          observer.complete();
        }

        const json = JSON.parse(event.data);
        if (json.error) {
          console.log(json.error);
          throw new Error(json.error.message);
        }

        onChunk(json as OpenRouterResponse, observer);
      };

      eventSource.onerror = (error): void => {
        observer.error(error);
      };

      return () => {
        eventSource.close();
      };
    });
  }
}
