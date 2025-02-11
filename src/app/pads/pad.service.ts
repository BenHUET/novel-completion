import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { defaultPrompts, storage_pad, storage_pads_ids } from '../app.consts';
import { v4 as uuidv4 } from 'uuid';
import { Pad } from './pad.model';
import { BehaviorSubject } from 'rxjs';
import Delta from 'quill-delta';

@Injectable({
  providedIn: 'root',
})
export class PadService {
  padsSubject = new BehaviorSubject<Pad[]>([]);

  constructor(private storageService: StorageService) {
    this.padsSubject.next(this.getAllPads());
  }

  getAllPads(): Pad[] {
    const ids = this.storageService.get(storage_pads_ids) as string[];
    if (ids) {
      return ids.map((id) => this.getPad(id)).filter((p) => p != null);
    }

    return [];
  }

  getPad(id: string): Pad | undefined {
    const json = this.storageService.get(this.getPadStorageKey(id));
    if (json) {
      return JSON.parse(json as string) as Pad;
    }

    return undefined;
  }

  createPad(): Pad {
    const id = uuidv4();

    const pad = this.savePad(
      id,
      {
        id: id,
        label: 'new pad',
        cost: 0,
        contents: new Delta([
          {
            insert:
              defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)],
          },
        ]),
      },
      false,
    );

    let ids = this.storageService.get(storage_pads_ids) as string[];
    if (!ids) {
      ids = [];
    }
    ids.push(id);
    this.storageService.set(storage_pads_ids, ids);

    this.padsSubject.next(this.getAllPads());

    return pad;
  }

  savePad(id: string, pad: Pad, notify: boolean): Pad {
    this.storageService.set(this.getPadStorageKey(id), JSON.stringify(pad));

    if (notify) {
      this.padsSubject.next(this.getAllPads());
    }

    return pad;
  }

  removePad(id: string): void {
    this.storageService.remove(this.getPadStorageKey(id));

    let ids = this.storageService.get(storage_pads_ids) as string[];
    ids = ids.filter((i) => i !== id);

    this.storageService.set(storage_pads_ids, ids);

    this.padsSubject.next(this.getAllPads());
  }

  private getPadStorageKey(id: string): string {
    return storage_pad.replace('{id}', id);
  }
}
