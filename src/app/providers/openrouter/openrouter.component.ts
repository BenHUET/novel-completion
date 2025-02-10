import {Component} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {StorageService} from '../../shared/storage.service';
import {storage_or_apiKey} from '../../app.consts';

@Component({
  selector: 'app-providers-openrouter',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './openrouter.component.html',
  styleUrl: './openrouter.component.css'
})
export class OpenRouterComponent {
  form: FormGroup;

  constructor(private storageService: StorageService) {
    this.form = new FormGroup<{
      apiKey: FormControl<string | null>
    }>({
      apiKey: new FormControl(this.storageService.get(storage_or_apiKey) as string)
    });

    this.form.get('apiKey')?.valueChanges.subscribe((value) => {
      this.storageService.set(storage_or_apiKey, value);
    });
  }
}
