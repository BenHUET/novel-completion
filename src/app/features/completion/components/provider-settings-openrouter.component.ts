import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  OpenRouterCompletionRequest,
  OpenRouterProvider,
} from '../models/openrouter.model';
import { FormsModule } from '@angular/forms';
import { OpenRouterService } from '../services/openrouter.service';
import { AsyncPipe, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { OrderModule } from 'ngx-order-pipe';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ShortNumberPipe } from '../../../shared/pipes/short-number.pipe';
import { ProviderModel } from '../models/provider.model';
import { or_defaultModel } from '../../../shared/consts';
import { CompletionParametersComponent } from './completion-parameters.component';
import { enumIterator } from '../../../shared/helpers/enum.helper';
import { CompletionCapability } from '../models/completion.model';

@Component({
  selector: 'app-provider-settings-openrouter',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    AsyncPipe,
    OrderModule,
    CdkDropList,
    CdkDrag,
    ShortNumberPipe,
    DecimalPipe,
    CompletionParametersComponent,
  ],
  templateUrl: './provider-settings-openrouter.component.html',
})
export class ProviderSettingsOpenRouterComponent {
  @Input() request: OpenRouterCompletionRequest = {};
  @Output() requestChange = new EventEmitter<OpenRouterCompletionRequest>();
  models$ = new Observable<ProviderModel[]>();

  providersIsLoading = true;
  providers: OpenRouterProvider[] = [];

  completionCapabilities: CompletionCapability[] = [];

  constructor(private openRouterService: OpenRouterService) {
    (this.models$ = this.openRouterService.getModels()).subscribe({
      next: (res: ProviderModel[]) => {
        this.request.model = res[0].id;

        const defaultModel = res.find((m) => m.id === or_defaultModel);
        if (defaultModel) {
          this.request.model = defaultModel.id;
        }

        this.onModelChanged();
      },
      error: (err: unknown) => {
        console.log(err);
      },
    });
  }

  onModelChanged(): void {
    this.providers = [];
    this.providersIsLoading = true;
    this.openRouterService.getProviders(this.request.model!).subscribe({
      next: (res: OpenRouterProvider[]) => {
        this.providers = res;
        this.updateRequestProviders();
        this.updateCapabilities();
        this.providersIsLoading = false;
      },
      error: (err: unknown) => {
        console.log(err);
      },
    });
  }

  onProviderReordered(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.providers, event.previousIndex, event.currentIndex);
    this.updateRequestProviders();
  }

  onProviderChanged($event: Event, provider: OpenRouterProvider): void {
    provider.selected = !provider.selected;
    this.updateRequestProviders();
    this.updateCapabilities();
  }

  updateRequestProviders(): void {
    this.request.provider = {
      allow_fallbacks: false,
      order: this.providers
        .filter((p) => p.selected)
        .map((p) => p.provider_name),
    };
    this.requestChange.emit(this.request);
  }

  updateCapabilities(): void {
    this.completionCapabilities = [];
    this.providers
      .filter((p) => p.selected)
      .forEach((p) => {
        enumIterator<CompletionCapability>(
          CompletionCapability,
          (value: CompletionCapability, key?: string): void => {
            if (key) {
              if (p.supported_parameters.includes(key)) {
                this.completionCapabilities.push(value);
              }
            }
          },
        );
      });
  }
}
