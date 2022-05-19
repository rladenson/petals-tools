import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalService {

  constructor() { }

  get(key: string): any {
    return localStorage.getItem(key);
  }
  set(key: string, value: any): void {
    localStorage.setItem(key, value);
  }
}
