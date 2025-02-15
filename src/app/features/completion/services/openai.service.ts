import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProviderService } from './provider.service';
import { map, Observable } from 'rxjs';
import {
  CompletionRequest,
  CompletionResponse,
} from '../models/completion.model';
import { ProviderResponse, StreamingChoice } from '../models/provider.model';
import { getObservableEventSource } from '../helpers/eventsource.helper';
import {
  ProviderGenerationCost,
  ProviderModel,
} from '../models/provider.model';
import { OpenAICompletionRequest } from '../models/openai.model';

@Injectable({
  providedIn: 'root',
})
export class OpenAIService implements ProviderService {
  constructor(private http: HttpClient) {}

  getGenerationCost(_: string, __: string): Observable<ProviderGenerationCost> {
    throw new Error('Method not supported.');
  }

  getChatCompletions(
    request: OpenAICompletionRequest,
    key: string,
  ): Observable<CompletionResponse> {
    const transformedRequest = {
      ...request,
      chat_completions: undefined,
    };

    if (request.model?.includes('o1')) {
      transformedRequest.max_completion_tokens = request.max_tokens;
      transformedRequest.max_tokens = undefined;
    }

    return getObservableEventSource<ProviderResponse, OpenAICompletionRequest>(
      transformedRequest,
      key,
      'https://api.openai.com/v1/chat/completions',
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
    _: CompletionRequest,
    __: string,
  ): Observable<CompletionResponse> {
    throw new Error('Method not supported.');
  }

  getModels(key: string): Observable<ProviderModel[]> {
    return this.http
      .get<{ data: ProviderModel[] }>('https://api.openai.com/v1/models', {
        headers: {
          Authorization: 'Bearer ' + key,
          'Content-Type': 'application/json',
        },
      })
      .pipe<ProviderModel[]>(
        map((res) => {
          return res.data;
        }),
      );
  }
}
