import Inline from 'quill/blots/inline';

export class InferredBlot extends Inline {
  static override blotName = 'inferred';
  static override className = 'inferred';
  static override tagName = 'span';

  static override formats(): boolean {
    return true;
  }
}
