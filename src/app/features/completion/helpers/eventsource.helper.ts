import { Observable, Subscriber } from 'rxjs';
import { CompletionResponse } from '../models/completion.model';
import { EventSource } from 'eventsource';

export function getObservableEventSource<T, U>(
  request: U,
  key: string,
  url: string,
  onChunk: (chunk: T, observer: Subscriber<CompletionResponse>) => void,
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
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }).then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text || response.statusText);
            });
          }

          return response;
        }),
    });

    eventSource.onmessage = (event): void => {
      if (event.data === '[DONE]') {
        observer.complete();
      }

      interface JsonResponse extends CompletionResponse {
        error: { message: string };
      }

      const json = JSON.parse(event.data as string) as JsonResponse;
      if (json.error) {
        console.log('json.error');
        throw new Error(json.error.message);
      }

      onChunk(json as T, observer);
    };

    eventSource.onerror = (error): void => {
      observer.error(error);
    };

    return () => {
      eventSource.close();
    };
  });
}
