import { Injectable, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class FarmerDataStorageService {
  private readonly auth = inject(AuthService);

  read<T>(key: string, fallback: T): T {
    const scopedKey = this.scopedKey(key);
    const scopedValue = localStorage.getItem(scopedKey);
    if (scopedValue !== null) return this.parse<T>(scopedValue, key, fallback).value;

    const legacyValue = localStorage.getItem(key);
    if (legacyValue === null) return fallback;
    const parsed = this.parse<T>(legacyValue, key, fallback);
    if (!parsed.valid) return fallback;
    localStorage.setItem(scopedKey, legacyValue);
    localStorage.removeItem(key);
    return parsed.value;
  }

  private parse<T>(value: string, key: string, fallback: T): { valid: boolean; value: T } {
    try {
      return { valid: true, value: JSON.parse(value) as T };
    } catch (error) {
      console.error(`Invalid saved farm data for "${key}".`, error);
      return { valid: false, value: fallback };
    }
  }

  write(key: string, value: unknown): void {
    localStorage.setItem(this.scopedKey(key), JSON.stringify(value));
  }

  private scopedKey(key: string): string {
    const farmerId = this.auth.farmer()?.farmerId;
    if (farmerId === undefined) throw new Error('Farmer storage requires an authenticated account.');
    return `km-user:${farmerId}:${key}`;
  }
}
