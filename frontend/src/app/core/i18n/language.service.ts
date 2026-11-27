import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type LanguageCode = 'gu' | 'hi' | 'en';
type TranslationCatalog = Record<string, string>;

const LANGUAGE_LOCALES: Record<LanguageCode, string> = {
  gu: 'gu-IN',
  hi: 'hi-IN',
  en: 'en-IN'
};

function isLanguageCode(value: string | null): value is LanguageCode {
  return value === 'gu' || value === 'hi' || value === 'en';
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly http = inject(HttpClient);
  private readonly catalog = signal<TranslationCatalog>({});
  private readonly languageState = signal<LanguageCode>(this.readSavedLanguage());

  readonly language = this.languageState.asReadonly();
  readonly locale = computed(() => LANGUAGE_LOCALES[this.languageState()]);

  async initialize(): Promise<void> {
    await this.loadCatalog(this.languageState());
  }

  async setLanguage(language: LanguageCode): Promise<void> {
    this.languageState.set(language);
    this.saveLanguage(language);
    await this.loadCatalog(language);
  }

  hasSavedPreference(): boolean {
    try {
      return isLanguageCode(localStorage.getItem('km-language'));
    } catch {
      return false;
    }
  }

  translate(key: string): string {
    return this.catalog()[key] ?? key;
  }

  private async loadCatalog(language: LanguageCode): Promise<void> {
    try {
      const catalog = await firstValueFrom(
        this.http.get<TranslationCatalog>(`/assets/i18n/${language}.json`)
      );
      this.catalog.set(catalog);
      document.documentElement.lang = language;
    } catch {
      if (language !== 'gu') {
        await this.loadCatalog('gu');
      }
    }
  }

  private readSavedLanguage(): LanguageCode {
    try {
      const saved = localStorage.getItem('km-language');
      return isLanguageCode(saved) ? saved : 'gu';
    } catch {
      return 'gu';
    }
  }

  private saveLanguage(language: LanguageCode): void {
    try {
      localStorage.setItem('km-language', language);
    } catch {
      return;
    }
  }
}