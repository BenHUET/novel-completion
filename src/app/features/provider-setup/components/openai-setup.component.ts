import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from '../../../core/services/storage.service';
import { storage_oai_apiKey } from '../../../shared/consts';

@Component({
  selector: 'app-provider-setup-openai',
  imports: [ReactiveFormsModule],
  templateUrl: './openai-setup.component.html',
  styleUrl: '../openai-setup/openai-setup.component.css',
})
export class OpenAISetupComponent {
  form: FormGroup;

  constructor(private storageService: StorageService) {
    this.form = new FormGroup<{
      apiKey: FormControl<string | null>;
    }>({
      apiKey: new FormControl(
        this.storageService.get(storage_oai_apiKey) as string,
      ),
    });

    this.form.get('apiKey')?.valueChanges.subscribe((value) => {
      this.storageService.set(storage_oai_apiKey, value);
    });
  }
}
