import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OpenRouterCompletionRequest } from '../models/openrouter.model';
import { FormsModule } from '@angular/forms';
import { CompletionCapability } from '../models/provider.model';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-completion-parameters',
  imports: [FormsModule, NgIf],
  templateUrl: './completion-parameters.component.html',
})
export class CompletionParametersComponent {
  @Input() request: OpenRouterCompletionRequest = {};
  @Output() requestChange = new EventEmitter<OpenRouterCompletionRequest>();

  @Input() capabilities: CompletionCapability[] = [];

  hasCapability(capability: CompletionCapability): boolean {
    return this.capabilities.includes(capability);
  }

  protected readonly CompletionCapability = CompletionCapability;
}
