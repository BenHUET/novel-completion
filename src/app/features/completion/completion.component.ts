import {
  Component,
  HostListener,
  inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { OpenRouterService } from './services/openrouter.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  CompletionRequest,
  CompletionResponse,
  Message,
} from './models/completion.model';
import { Observable, Subscription } from 'rxjs';
import { DecimalPipe, NgIf } from '@angular/common';
import { CompletionPadComponent } from './components/completion-pad.component';
import { OpenRouterCompletionRequest } from './models/openrouter.model';
import { ProviderSettingsOpenRouterComponent } from './components/provider-settings-openrouter.component';
import { getEncoding, Tiktoken } from 'js-tiktoken';
import { StorageService } from '../../core/services/storage.service';
import { storage_oai_apiKey, storage_or_apiKey } from '../../shared/consts';
import { ProviderSettingsOpenAIComponent } from './components/provider-settings-openai.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { Pad } from '../../shared/models/pad.model';
import { PadService } from '../../shared/services/pad.service';
import { ToastService } from '../../core/services/toast.service';
import { OpenAIService } from './services/openai.service';
import { ProviderService } from './services/provider.service';
import { OpenAICompletionRequest } from './models/openai.model';

@Component({
  selector: 'app-completion',
  imports: [
    FormsModule,
    NgIf,
    CompletionPadComponent,
    ProviderSettingsOpenRouterComponent,
    ProviderSettingsOpenAIComponent,
    ReactiveFormsModule,
    DecimalPipe,
  ],
  templateUrl: './completion.component.html',
})
export class CompletionComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  modalService = inject(NgbModal);

  @ViewChild(CompletionPadComponent) padComponent!: CompletionPadComponent;

  encoder: Tiktoken = getEncoding('o200k_base');
  pad!: Pad;
  reasoning?: string;
  tokenCount = 0;
  provider!: 'openrouter' | 'openai';
  providerService!: ProviderService;

  defaultRequest: CompletionRequest = {
    temperature: 0.5,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
  };
  openRouterRequest: OpenRouterCompletionRequest = {
    ...this.defaultRequest,
    top_k: 0,
    top_a: 0,
    min_p: 0,
    repetition_penalty: 1,
    chat_completions: true,
    include_reasoning: true,
  };
  openAIRequest: OpenAICompletionRequest = {
    ...this.defaultRequest,
    chat_completions: true,
  };

  isInitializing = true;
  isRunning = false;
  isRetryable = false;
  beforeQueryCharacterCount = 0;
  querySubscription?: Subscription;

  formEditPad = new FormGroup<{
    label: FormControl<string | null>;
  }>({ label: new FormControl<string>('') });

  constructor(
    private openRouterService: OpenRouterService,
    private openAIService: OpenAIService,
    private storageService: StorageService,
    private padService: PadService,
    private toastService: ToastService,
  ) {
    this.provider = 'openrouter';
    this.onProviderChange();

    this.route.queryParams.subscribe((params) => {
      this.loadPad(params['id'] as string);
      this.abort();
      this.formEditPad.get('label')!.setValue(this.pad.label);
    });

    this.formEditPad.get('label')?.valueChanges.subscribe((value) => {
      this.pad.label = value ?? '';
      this.savePad(true);
    });
  }

  ngOnInit(): void {
    this.isInitializing = false;
  }

  onEditorReady(): void {
    this.onContentChange();
  }

  onContentChange(): void {
    this.tokenCount = this.encoder.encode(
      this.padComponent.quillEditor.getText(),
    ).length;

    // If the content change but the isRunning flag is false, it means it's the user making changes thus disabling retry
    this.isRetryable = this.isRunning;

    if (!this.isInitializing) {
      this.savePad(false);
    }
  }

  onProviderChange(): void {
    switch (this.provider) {
      case 'openrouter':
        this.providerService = this.openRouterService;
        break;
      case 'openai':
        this.providerService = this.openAIService;
    }
  }

  retry(): void {
    this.padComponent.undo();
    this.run();
  }

  run(): void {
    this.isRunning = true;
    this.reasoning = undefined;
    let query: Observable<CompletionResponse>;

    const key = this.getApiKey();

    let request: CompletionRequest;
    switch (this.provider) {
      case 'openrouter':
        request = this.openRouterRequest;
        break;
      case 'openai':
        request = this.openAIRequest;
        break;
    }

    // hack : remove the last newline added by the browser
    request.messages = this.splitPrompt(
      this.padComponent.quillEditor.getText().slice(0, -1),
    );

    // the prompt is the whole content excluding instructions
    request.prompt = request.messages
      .filter((p) => p.role === 'assistant')
      .map((m) => m.content)
      .join('');

    // used to undo on retry
    this.beforeQueryCharacterCount = request.prompt.length;

    if (request.chat_completions) {
      request.prompt = undefined;
      query = this.providerService.getChatCompletions(request, key);
    } else {
      request.messages = undefined;
      query = this.providerService.getCompletions(request, key);
    }

    console.log(request);

    let generationId: string | undefined = undefined;
    this.querySubscription = query.subscribe({
      next: (res: CompletionResponse) => {
        if (res.text) {
          this.padComponent.insert(res.text, generationId === undefined);
          generationId = res.id;
        }

        if (res.reasoning) {
          if (!this.reasoning) {
            this.reasoning = '';
          }
          this.reasoning += res.reasoning;
        }
      },
      error: (err: unknown) => {
        console.log(err);
        this.isRunning = false;
        this.toastService.show({
          type: 'error',
          message: 'request error',
        });
      },
      complete: () => {
        this.isRunning = false;

        this.toastService.show({
          type: 'success',
          message: 'request done',
        });

        if (generationId) {
          this.queryCosts(generationId);
        }
      },
    });
  }

  splitPrompt(prompt: string): Message[] {
    const parts: Message[] = [];
    const regex =
      /<sys>(.*?)<\/sys>|<inst>(.*?)<\/inst>|<dev>(.*?)<\/dev>|([^<]+)/g;

    let match;
    while ((match = regex.exec(prompt)) !== null) {
      if (match[1] && match[1].trim() !== '') {
        parts.push({ role: 'system', content: match[1] });
      } else if (match[2]) {
        if (match[2] && match[2].trim() !== '') {
          parts.push({ role: 'user', content: match[2].trim() });
        }
      } else if (match[3]) {
        if (match[3] && match[3].trim() !== '') {
          parts.push({ role: 'developer', content: match[3].trim() });
        }
      } else if (match[4]) {
        if (match[4] && match[4].trim() !== '') {
          parts.push({ role: 'assistant', content: match[4].trim() });
        }
      }
    }

    return parts;
  }

  abort(): void {
    if (!this.isRunning) {
      return;
    }

    this.querySubscription?.unsubscribe();
    this.isRunning = false;
    this.toastService.show({
      type: 'warning',
      message: 'request aborted',
    });
  }

  queryCosts(id: string): void {
    const key = this.getApiKey();

    try {
      this.providerService.getGenerationCost(id, key).subscribe((res) => {
        this.pad.cost = res.total_cost;
        this.savePad(false);
      });
    } catch (_) {
      // do nothing if the provider does not provide a way to get costs from API
    }
  }

  loadPad(id: string): void {
    this.pad = this.padService.getPad(id)!;
    if (this.padComponent) {
      this.padComponent.setContents(this.pad.contents);
      this.onContentChange();
    }
  }

  savePad(notify: boolean): void {
    this.padService.savePad(this.pad.id, this.pad, notify);
  }

  deletePad(): void {
    this.padService.removePad(this.pad.id);
  }

  getApiKey(): string {
    let storageKey;
    switch (this.provider) {
      case 'openrouter':
        storageKey = storage_or_apiKey;
        break;
      case 'openai':
        storageKey = storage_oai_apiKey;
        break;
    }

    return (this.storageService.get(storageKey) as string) ?? '';
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'Enter') {
      this.run();
    }
  }

  openReasoningModal(content: TemplateRef<unknown>): void {
    this.modalService.open(content, { scrollable: true });
  }

  openDeletePadModal(deleteModal: TemplateRef<unknown>): void {
    this.modalService.open(deleteModal);
  }

  openEditPadModel(editModal: TemplateRef<unknown>): void {
    this.modalService.open(editModal);
  }
}
