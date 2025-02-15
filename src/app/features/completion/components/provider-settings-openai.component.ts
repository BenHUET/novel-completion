import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProviderModel } from '../models/provider.model';
import { Observable } from 'rxjs';
import { oai_defaultModel, storage_oai_apiKey } from '../../../shared/consts';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderModule } from 'ngx-order-pipe';
import { OpenAIService } from '../services/openai.service';
import { StorageService } from '../../../core/services/storage.service';
import { CompletionParametersComponent } from './completion-parameters.component';
import { OpenAICompletionRequest } from '../models/openai.model';
import { CompletionCapability } from '../models/completion.model';

@Component({
  selector: 'app-provider-settings-openai',
  imports: [
    AsyncPipe,
    FormsModule,
    NgForOf,
    NgIf,
    OrderModule,
    CompletionParametersComponent,
  ],
  templateUrl: './provider-settings-openai.component.html',
})
export class ProviderSettingsOpenAIComponent {
  @Input() request: OpenAICompletionRequest = {};
  @Output() requestChange = new EventEmitter<OpenAICompletionRequest>();

  models$ = new Observable<ProviderModel[]>();

  completionCapabilities: CompletionCapability[] = [
    CompletionCapability.temperature,
    CompletionCapability.frequence_penalty,
    CompletionCapability.logit_bias,
    CompletionCapability.max_tokens,
    CompletionCapability.presence_penalty,
    CompletionCapability.top_p,
  ];

  constructor(
    private openAIService: OpenAIService,
    private storageService: StorageService,
  ) {
    const key = (this.storageService.get(storage_oai_apiKey) as string) ?? '';

    (this.models$ = this.openAIService.getModels(key)).subscribe({
      next: (res: ProviderModel[]) => {
        this.request.model = res[0].id;

        const defaultModel = res.find((m) => m.id === oai_defaultModel);
        if (defaultModel) {
          this.request.model = defaultModel.id;
        }
      },
      error: (err: unknown) => {
        console.log(err);
      },
    });
  }

  onModelChanged(): void {
    if (this.request.model?.includes('o1')) {
      this.completionCapabilities = this.completionCapabilities.filter(
        (c: CompletionCapability) => {
          return c !== CompletionCapability.temperature;
        },
      );

      this.request.temperature = 1;
    } else {
      if (
        !this.completionCapabilities.includes(CompletionCapability.temperature)
      ) {
        this.completionCapabilities.push(CompletionCapability.temperature);
      }
    }
  }
}
