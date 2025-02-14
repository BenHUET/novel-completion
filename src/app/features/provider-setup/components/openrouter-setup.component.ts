import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { StorageService } from '../../../core/services/storage.service';
import { storage_or_apiKey } from '../../../shared/consts';

@Component({
  selector: 'app-provider-setup-openrouter',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './openrouter-setup.component.html',
})
export class OpenRouterSetupComponent {
  form: FormGroup;

  constructor(private storageService: StorageService) {
    this.form = new FormGroup<{
      apiKey: FormControl<string | null>;
    }>({
      apiKey: new FormControl(
        this.storageService.get(storage_or_apiKey) as string,
      ),
    });

    this.form.get('apiKey')?.valueChanges.subscribe((value) => {
      this.storageService.set(storage_or_apiKey, value);
    });
  }
}
