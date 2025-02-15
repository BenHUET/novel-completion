import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContentChange, QuillEditorComponent } from 'ngx-quill';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Quill from 'quill';
import '../blots/inferred.quill.blot';
import { InferredBlot } from '../blots/inferred.quill.blot';
import Delta from 'quill-delta';

@Component({
  selector: 'app-completion-pad',
  imports: [QuillEditorComponent, ReactiveFormsModule],
  templateUrl: './completion-pad.component.html',
  styleUrl: './completion-pad.component.css',
})
export class CompletionPadComponent implements OnInit {
  @Input() contents: Delta = new Delta();
  @Output() contentsChange = new EventEmitter<Delta>();

  @Input() isReadOnly = true;
  @Output() isReadOnlyChange = new EventEmitter<boolean>();

  @Output() editorReady = new EventEmitter();
  @Output() editorChange = new EventEmitter<string>();

  quillEditor!: Quill;
  quillConfig = {
    modules: {
      list: false,
      toolbar: false,
      history: {
        userOnly: true,
      },
      keyboard: {
        bindings: {
          bold: null,
          italic: null,
          underline: null,
          indent: null,
          outdent: null,
          'outdent backspace': null,
          'indent code-block': null,
          'outdent code-block': null,
          'remove tab': null,
          tab: null,
          'blockquote empty enter': null,
          'list empty enter': null,
          'checklist enter': null,
          'header enter': null,
          'table backspace': null,
          'table enter': null,
          'table tab': null,
          'list autofill': null,
          'code exit': null,
          'embed left': null,
          'embed left shift': null,
          'embed right': null,
          'embed right shift': null,
          'table down': null,
          'table up': null,
        },
      },
    },
    formats: ['inferred'],
  };

  form!: FormGroup;
  deltaBeforeInsert?: Delta;

  ngOnInit(): void {
    Quill.register(InferredBlot);

    this.form = new FormGroup({
      content: new FormControl(),
    });

    this.form.valueChanges.subscribe((_) => {
      if (this.quillEditor) {
        this._emitChanges();
      }
    });
  }

  created(editor: Quill): void {
    this.quillEditor = editor;
    this.quillEditor.clipboard.addMatcher(Node.ELEMENT_NODE, (_, delta) => {
      const ops = delta.ops.map((op) => ({ insert: op.insert }));
      return new Delta(ops);
    });

    this.setContents(this.contents);
    this.editorReady.emit();
  }

  setContents(contents: Delta): void {
    if (this.quillEditor) {
      this.quillEditor.setContents(contents);
    }
  }

  insert(inferred?: string, begin?: boolean): void {
    if (begin) {
      this.deltaBeforeInsert = this.quillEditor.getContents();
    }

    if (inferred) {
      this.quillEditor.insertText(
        this.quillEditor.getLength() - 1,
        inferred,
        'inferred',
        true,
      );
      this._emitChanges();
      this.quillEditor.root.scrollTop = this.quillEditor.root.scrollHeight;
    }
  }

  undo(): void {
    // ideally it would use the `history` module provided by quill to handle the undo but there is a bug somewhere with cutoff()/options.delay
    this.quillEditor.setContents(this.deltaBeforeInsert!);
    this._emitChanges();
  }

  onContentChanged($event: ContentChange): void {
    if (!this.isReadOnly) {
      if ($event.delta.ops.at(-1)?.insert) {
        const currentIndex = ($event.delta.ops.at(0)?.retain as number) + 1;
        const currentBlot = this.quillEditor.getLeaf(currentIndex);

        if (
          currentBlot &&
          currentBlot[0]?.domNode.parentElement?.classList.contains('inferred')
        ) {
          this.quillEditor.formatText(currentIndex - 1, 1, 'inferred', false);
        }
      }
    }
  }

  private _emitChanges(): void {
    this.contentsChange.emit(this.quillEditor.getContents());
    this.editorChange.emit(this.quillEditor.getText());
  }
}
