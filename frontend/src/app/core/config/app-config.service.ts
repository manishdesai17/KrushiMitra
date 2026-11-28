import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly runtimeUrl = (globalThis as typeof globalThis & {
    KRUSHIMITRA_CONFIG?: { apiUrl?: string };
  }).KRUSHIMITRA_CONFIG?.apiUrl;

  readonly apiUrl = (this.runtimeUrl ?? 'http://localhost:8080').replace(/\/$/, '');

  readonly authUrl = `${this.apiUrl}/api/auth`;
  readonly farmersUrl = `${this.apiUrl}/api/farmers`;
  readonly conversationsUrl = `${this.apiUrl}/api/ai/conversations`;
  readonly marketPricesUrl = `${this.apiUrl}/api/market/prices`;
}
