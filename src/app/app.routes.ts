import { Routes } from '@angular/router';
import { CompletionComponent } from './features/completion/completion.component';
import { ProviderSetupComponent } from './features/provider-setup/provider-setup.component';

export const routes: Routes = [
  { path: 'providers', component: ProviderSetupComponent },
  { path: 'completion', component: CompletionComponent },
  { path: '', redirectTo: '/providers', pathMatch: 'full' },
];
