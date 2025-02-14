import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  set(key: string, data: unknown): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  get(key: string): unknown {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }

    return null;
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}
