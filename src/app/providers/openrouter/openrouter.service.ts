import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProviderService } from '../provider.service';
import { EventSource } from 'eventsource';
import {
  OpenRouterCompletionRequest,
  OpenRouterCompletionResponse,
  OpenRouterGeneration,
  OpenRouterModel,
  OpenRouterNonChatChoice,
  OpenRouterProvider,
  OpenRouterStreamingChoice,
} from './openrouter.model';
import { map, Observable, retry, Subscriber } from 'rxjs';
import { CompletionResponse, ProviderModel } from '../provider.model';

@Injectable({
  providedIn: 'root',
})
export class OpenRouterService implements ProviderService {
  constructor(private http: HttpClient) {}

  getChatCompletions(
    request: OpenRouterCompletionRequest,
    key: string,
  ): Observable<CompletionResponse> {
    console.log(request);
    return this.getObservableEventSource(
      request,
      key,
      '/openrouter/api/v1/chat/completions',
      (chunk, observer) => {
        const choice = chunk.choices[0] as OpenRouterStreamingChoice;
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
    console.log(request);
    return this.getObservableEventSource(
      request,
      key,
      '/openrouter/api/v1/completions',
      (chunk, observer) => {
        const text = (chunk.choices[0] as OpenRouterNonChatChoice).text;
        if (text !== null)
          observer.next({
            text: (chunk.choices[0] as OpenRouterNonChatChoice).text,
          });
      },
    );
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

  getGenerationCost(id: string, key: string): Observable<OpenRouterGeneration> {
    return this.http
      .get<{ data: OpenRouterGeneration }>(
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
    request: OpenRouterCompletionRequest,
    key: string,
    url: string,
    onChunk: (
      chunk: OpenRouterCompletionResponse,
      observer: Subscriber<CompletionResponse>,
    ) => void,
  ): Observable<CompletionResponse> {
    return new Observable<CompletionResponse>((observer) => {
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

        interface JsonResponse extends OpenRouterCompletionResponse {
          error: { message: string };
        }

        const json = JSON.parse(event.data as string) as JsonResponse;
        if (json.error) {
          console.log(json.error);
          throw new Error(json.error.message);
        }

        onChunk(json as OpenRouterCompletionResponse, observer);
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
