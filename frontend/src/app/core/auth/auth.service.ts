import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { LanguageCode, LanguageService } from '../i18n/language.service';
import { AppConfigService } from '../config/app-config.service';

export interface FarmerProfile {
  farmerId: number;
  fullName: string;
  mobileNumber: string;
  email: string | null;
  village: string;
  taluka: string;
  district: string;
  state: string;
  preferredLanguage: LanguageCode;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  farmerId: number;
  fullName: string;
  mobileNumber: string;
  preferredLanguage: LanguageCode;
}

export interface RegisterRequest {
  fullName: string;
  mobileNumber: string;
  email?: string;
  password: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  language: LanguageCode;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly languageService = inject(LanguageService);
  private readonly config = inject(AppConfigService);
  private readonly apiUrl = this.config.authUrl;
  private readonly tokenState = signal(this.readToken());
  private readonly farmerState = signal<FarmerProfile | null>(null);

  readonly farmer = this.farmerState.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenState() !== null && this.farmerState() !== null);

  login(mobileNumber: string, password: string, language?: LanguageCode): Observable<void> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      mobileNumber,
      password,
      ...(language ? { language } : {})
    }).pipe(tap(response => this.acceptSession(response)), map(() => undefined));
  }

  register(request: RegisterRequest): Observable<void> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(tap(response => this.acceptSession(response)), map(() => undefined));
  }

  restoreSession(): Observable<void> {
    if (!this.tokenState()) return of(undefined);
    return this.http.get<FarmerProfile>(`${this.apiUrl}/me`).pipe(
      tap(profile => {
        this.farmerState.set(profile);
        void this.languageService.setLanguage(profile.preferredLanguage);
      }),
      map(() => undefined),
      catchError(() => {
        this.clearSession();
        return of(undefined);
      })
    );
  }

  updateLanguage(language: LanguageCode): Observable<FarmerProfile> {
    return this.http.put<FarmerProfile>(`${this.apiUrl}/language`, { language }).pipe(
      tap(profile => {
        this.farmerState.set(profile);
        void this.languageService.setLanguage(profile.preferredLanguage);
      })
    );
  }

  logout(): void {
    this.clearSession();
  }

  token(): string | null {
    return this.tokenState();
  }

  private acceptSession(response: AuthResponse): void {
    this.writeToken(response.accessToken);
    this.tokenState.set(response.accessToken);
    this.farmerState.set({
      farmerId: response.farmerId,
      fullName: response.fullName,
      mobileNumber: response.mobileNumber,
      email: null,
      village: '',
      taluka: '',
      district: '',
      state: '',
      preferredLanguage: response.preferredLanguage
    });
    void this.languageService.setLanguage(response.preferredLanguage);
  }

  private clearSession(): void {
    this.tokenState.set(null);
    this.farmerState.set(null);
    try {
      sessionStorage.removeItem('km-access-token');
    } catch {
      return;
    }
  }

  private readToken(): string | null {
    try {
      return sessionStorage.getItem('km-access-token');
    } catch {
      return null;
    }
  }

  private writeToken(token: string): void {
    try {
      sessionStorage.setItem('km-access-token', token);
    } catch {
      return;
    }
  }
}