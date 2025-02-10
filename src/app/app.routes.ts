import {Routes} from '@angular/router';
import {CompletionsComponent} from './completions/completions.component';
import {ProvidersComponent} from './providers/providers.component';

export const routes: Routes = [
  {path: 'providers', component: ProvidersComponent},
  {path: 'completions', component: CompletionsComponent},
  {path: '', redirectTo: '/providers', pathMatch: 'full'}
];
