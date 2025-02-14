import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  OpenRouterCompletionRequest,
  OpenRouterProvider,
} from '../../providers/openrouter/openrouter.model';
import { FormsModule } from '@angular/forms';
import { OpenRouterService } from '../../providers/openrouter/openrouter.service';
import { AsyncPipe, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { OrderModule } from 'ngx-order-pipe';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ShortNumberPipe } from '../../shared/short-number.pipe';
import {
  CompletionCapability,
  ProviderModel,
} from '../../providers/provider.model';
import { or_defaultModel } from '../../app.consts';
import { CompletionSettingsComponent } from '../completion-settings/completion-settings.component';

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
    CompletionSettingsComponent,
  ],
  templateUrl: './provider-settings-openrouter.component.html',
})
export class ProviderSettingsOpenrouterComponent {
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
}
