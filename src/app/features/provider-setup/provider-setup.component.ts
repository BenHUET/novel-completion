import { Component } from '@angular/core';
import { OpenRouterSetupComponent } from './components/openrouter-setup.component';
import { OpenAISetupComponent } from './components/openai-setup.component';

@Component({
  selector: 'app-provider-setup',
  imports: [OpenRouterSetupComponent, OpenAISetupComponent],
  templateUrl: './provider-setup.component.html',
})
export class ProviderSetupComponent {}
