import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OpenRouterCompletionRequest } from '../../providers/openrouter/openrouter.model';
import { FormsModule } from '@angular/forms';
import { CompletionCapability } from '../../providers/provider.model';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-provider-settings',
  imports: [FormsModule, NgIf],
  templateUrl: './completion-settings.component.html',
})
export class CompletionSettingsComponent {
  @Input() request: OpenRouterCompletionRequest = {};
  @Output() requestChange = new EventEmitter<OpenRouterCompletionRequest>();

  @Input() capabilities: CompletionCapability[] = [];

  hasCapability(capability: CompletionCapability): boolean {
    return this.capabilities.includes(capability);
  }

  protected readonly CompletionCapability = CompletionCapability;
}
