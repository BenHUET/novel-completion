import Delta from 'quill-delta';

export interface Pad {
  id: string,
  label: string,
  contents: Delta
}
