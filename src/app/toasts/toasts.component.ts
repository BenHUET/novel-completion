import {Component, inject} from '@angular/core';

import {ToastService} from './toast.service';
import {NgIf} from '@angular/common';
import {NgbToastModule} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-toasts',
  imports: [NgbToastModule, NgIf],
  templateUrl: './toasts.component.html',
})
export class ToastsComponent {
  toastService = inject(ToastService);
}
