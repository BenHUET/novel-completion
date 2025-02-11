import Delta from 'quill-delta';

export interface Pad {
  id: string,
  label: string,
  cost: number,
  contents: Delta
}
