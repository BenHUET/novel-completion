import {Component, HostListener, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {OpenRouterService} from '../providers/openrouter/openrouter.service';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProviderRequest, ProviderResponse} from '../providers/provider.model';
import {Observable, Subscription} from 'rxjs';
import {NgIf} from '@angular/common';
import {CompletionPadComponent} from './completion-pad/completion-pad.component';
import {OpenRouterRequest} from '../providers/openrouter/openrouter.model';
import {CompletionSettingsOpenRouterComponent} from './completion-settings/completion-settings-openrouter.component';
import {getEncoding, Tiktoken} from "js-tiktoken";
import {StorageService} from '../storage/storage.service';
import {storage_or_apiKey} from '../app.consts';
import {CompletionSettingsOpenaiComponent} from './completion-settings/completion-settings-openai.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute, Router} from '@angular/router';
import {Pad} from '../pads/pad.model';
import {PadService} from '../pads/pad.service';
import {ToastService} from '../toasts/toast.service';

@Component({
  selector: 'app-completions',
  imports: [
    FormsModule,
    NgIf,
    CompletionPadComponent,
    CompletionSettingsOpenRouterComponent,
    CompletionSettingsOpenaiComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './completions.component.html',
  styleUrl: './completions.component.css'
})
export class CompletionsComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  modalService = inject(NgbModal);

  @ViewChild(CompletionPadComponent) padComponent!: CompletionPadComponent;
  @ViewChild('successToast') successToast!: TemplateRef<unknown>;

  reasoning?: string;
  defaultRequest: ProviderRequest = {
    chat_completions: true,
    temperature: 0.5,
    max_tokens: 256,
    top_p: 1,
    top_k: 0,
    frequency_penalty: 0,
    presence_penalty: 0,
    repetition_penalty: 1,
    min_p: 0,
    top_a: 0,
    stream: true
  };
  provider = "openrouter";
  openRouterRequest: OpenRouterRequest = {...this.defaultRequest, include_reasoning: true};
  isInitializing = true;
  isRunning = false;
  isRetryable = false;
  beforeQueryCharacterCount = 0;
  encoder: Tiktoken = getEncoding("o200k_base");
  tokenCount = 0;
  $querySubscription?: Subscription;
  queryParams$!: Subscription;
  pad!: Pad;
  formEditPad = new FormGroup<{
    label: FormControl<string>
  }>({label: new FormControl()});

  constructor(
    private providerService: OpenRouterService,
    private storageService: StorageService,
    private padService: PadService,
    private toastService: ToastService
  ) {
    this.queryParams$ = this.route.queryParams.subscribe(params => {
      this.loadPad(params['id']);
      this.abort();
      this.formEditPad.get('label')!.setValue(this.pad.label);
    });

    this.formEditPad.get('label')?.valueChanges.subscribe((value) => {
      this.pad.label = value;
      this.savePad(true);
    });
  }

  ngOnInit() {
    this.isInitializing = false;
  }

  onEditorReady() {
    this.onContentChange();
  }

  onContentChange() {
    this.tokenCount = this.encoder.encode(this.padComponent.quillEditor.getText()).length;

    // If the content change but the isRunning flag is false, it means it's the user making changes thus disabling retry
    this.isRetryable = this.isRunning;

    if (!this.isInitializing) {
      this.savePad(false);
    }
  }

  retry(): void {
    this.padComponent.undo();
    this.run();
  }

  run(): void {
    let request: ProviderRequest;
    switch (this.provider) {
      case 'openrouter':
        request = this.openRouterRequest;
        break;
      default:
        throw new Error("unsupported provider");
    }

    this.isRunning = true;
    this.reasoning = undefined;

    const prompt = this.padComponent.quillEditor.getText();

    // hack : remove the last newline added by the browser
    request.prompt = prompt.slice(0, -1);

    this.beforeQueryCharacterCount = request.prompt?.length;

    const key = this.storageService.get(storage_or_apiKey) as string ?? '';

    let query: Observable<ProviderResponse>;

    if (request.chat_completions) {
      // split text and instructions if any
      const splitPrompt = [];
      const regex = /<inst>(.*?)<\/inst>|([^<]+)/g;
      let match;
      while ((match = regex.exec(request.prompt)) !== null) {
        if (match[1] && match[1].trim() !== '') {
          splitPrompt.push({instruction: match[1]});
        } else if (match[2]) {
          const text = match[2].trim();
          if (text !== '') {
            splitPrompt.push({text: match[2].trim()});
          }
        }
      }

      request.messages = [{
        role: "system",
        content: "You act as a writing assistant, solely completing the user's text by picking up exactly where it stopped."
      }];
      let prefill: string | undefined;

      // there is instructions from the user
      if (splitPrompt.length > 1) {
        splitPrompt.forEach(part => {
          request.messages!.push({
            role: part.text ? "assistant" : "user",
            content: part.text ?? part.instruction
          });
        });

        // if the prompt ends with instructions, the prefill is a few words of the text right above
        // else, no need for a prefill
        if (splitPrompt.at(-1)!.instruction) {
          const lastPart = [...splitPrompt].reverse().find(p => p.text);
          if (lastPart) {
            prefill = lastPart.text!.split(' ').slice(-5).join(' ');
          }
        }
      }
      // no instructions
      else {
        request.messages.push({
          role: "user",
          content: request.prompt
        });

        // take the last few words as the prefill
        prefill = request.prompt.split(' ').slice(-5).join(' ');
      }

      if (prefill) {
        request.messages.push({
          role: "assistant",
          content: prefill
        });
      }

      request.prompt = undefined;
      query = this.providerService.getChatCompletions(request, key);
    } else {
      request.messages = undefined;
      query = this.providerService.getCompletions(request, key);
    }

    let firstInsert = true;

    this.$querySubscription = query.subscribe(
      {
        next: (res: ProviderResponse) => {
          if (res.text) {
            this.padComponent.insert(res.text, firstInsert);
            firstInsert = false;
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
        }
      }
    );
  }

  abort(): void {
    if (!this.isRunning) {
      return;
    }

    this.$querySubscription?.unsubscribe();
    this.isRunning = false;
    this.toastService.show({
      type: 'warning',
      message: 'request aborted',
    });
  }

  loadPad(id: string): void {
    this.pad = this.padService.getPad(id)!;
    if (this.padComponent) {
      this.padComponent.setContents(this.pad.contents);
      this.onContentChange();
    }
  }

  savePad(notify: boolean): void {
    this.padService.savePad(this.pad.id, this.pad!, notify);
  }

  deletePad(): void {
    this.padService.removePad(this.pad.id);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      this.run();
    }
  }

  openReasoningModal(content: TemplateRef<unknown>) {
    this.modalService.open(content, {scrollable: true});
  }

  openDeletePadModal(deleteModal: TemplateRef<unknown>) {
    this.modalService.open(deleteModal);
  }

  openEditPadModel(editModal: TemplateRef<unknown>) {
    this.modalService.open(editModal);
  }
}
