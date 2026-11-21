import { Component, inject, output, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { LucideArrowRight, LucideLeaf, LucideLockKeyhole, LucidePhone, LucideSprout } from '@lucide/angular';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageCode, LanguageService } from '../../core/i18n/language.service';

@Component({
  selector: 'app-auth-screen',
  imports: [FormsModule, LucideArrowRight, LucideLeaf, LucideLockKeyhole, LucidePhone, LucideSprout],
  templateUrl: './auth-screen.component.html',
  styleUrl: './auth-screen.component.css'
})
export class AuthScreenComponent {
  protected readonly auth = inject(AuthService);
  protected readonly language = inject(LanguageService);
  protected readonly authenticated = output<void>();
  protected readonly mode = signal<'login' | 'register'>('login');
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly languageTouched = signal(false);
  protected readonly selectedLanguage = signal<LanguageCode>(this.language.language());

  protected draft = {
    fullName: '',
    mobileNumber: '',
    email: '',
    password: '',
    village: '',
    taluka: '',
    district: '',
    state: 'Gujarat'
  };

  protected t(key: string): string {
    return this.language.translate(key);
  }

  protected async selectLanguage(language: LanguageCode): Promise<void> {
    this.selectedLanguage.set(language);
    this.languageTouched.set(true);
    await this.language.setLanguage(language);
  }

  protected toggleMode(): void {
    this.mode.update(mode => mode === 'login' ? 'register' : 'login');
    this.error.set('');
  }

  protected submit(form: NgForm): void {
    if (form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    const request = this.mode() === 'login'
      ? this.auth.login(this.draft.mobileNumber, this.draft.password,
          this.languageTouched() ? this.selectedLanguage() : undefined)
      : this.auth.register({ ...this.draft, language: this.selectedLanguage() });

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.authenticated.emit();
      },
      error: response => {
        this.loading.set(false);
        this.error.set(response.status === 401
          ? this.t('auth.invalidCredentials')
          : response.status === 0
            ? this.t('auth.serverUnavailable')
            : response.error?.detail ?? this.t('auth.requestFailed'));
      }
    });
  }
}