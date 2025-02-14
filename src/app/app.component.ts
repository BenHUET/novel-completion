import { Component, inject } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AsyncPipe, NgForOf } from '@angular/common';
import { Pad } from './shared/models/pad.model';
import { PadService } from './shared/services/pad.service';
import { Observable } from 'rxjs';
import { ToastsComponent } from './core/components/toasts.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgForOf,
    AsyncPipe,
    ToastsComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  router = inject(Router);
  route = inject(ActivatedRoute);

  pads$: Observable<Pad[]>;

  constructor(private padService: PadService) {
    this.pads$ = this.padService.padsSubject.asObservable();
    this.pads$.subscribe((pads) => {
      if (this.router.url.startsWith('/completion')) {
        const currentPadId = this.route.snapshot.queryParams['id'] as string;
        if (!pads.find((p) => p.id == currentPadId)) {
          if (pads.length == 0) {
            void this.router.navigate(['/providers']);
          } else {
            void this.router.navigate(['/completions'], {
              queryParams: { id: pads[0].id },
            });
          }
        }
      }
    });
  }

  onCreatePad(): void {
    const pad = this.padService.createPad();
    void this.router.navigate(['/completions'], {
      queryParams: { id: pad.id },
    });
  }
}
