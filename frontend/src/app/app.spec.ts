import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => {
    sessionStorage.removeItem('km-access-token');
    localStorage.removeItem('km-language');
    localStorage.removeItem('km-user:42:km-chat');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the welcome screen before first use', async () => {
    sessionStorage.removeItem('km-access-token');
    localStorage.removeItem('km-language');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http.match('/assets/i18n/gu.json').forEach(request => request.flush({
      'brand.name': 'કૃષિમિત્ર',
      'common.loading': 'લોડ થઈ રહ્યું છે...'
    }));

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.welcome-screen')).not.toBeNull();
    http.verify();
  });

  it('loads assistant conversations after sign-in', async () => {
    localStorage.setItem('km-language', 'en');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/assets/i18n/en.json').flush({});
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.welcome-start').click();
    const welcomeLanguage = http.expectOne('/assets/i18n/en.json');
    welcomeLanguage.flush({});
    await fixture.whenStable();
    fixture.detectChanges();

    const mobile = fixture.nativeElement.querySelector('input[name="mobileNumber"]') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('input[name="password"]') as HTMLInputElement;
    mobile.value = '9876543210';
    mobile.dispatchEvent(new Event('input', { bubbles: true }));
    password.value = 'password';
    password.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    const submit = fixture.nativeElement.querySelector('.auth-submit') as HTMLButtonElement | null;
    submit?.click();

    http.expectOne('http://localhost:8080/api/auth/login').flush({
      accessToken: 'test-token',
      tokenType: 'Bearer',
      farmerId: 42,
      fullName: 'Test Farmer',
      mobileNumber: '9876543210',
      preferredLanguage: 'en'
    });
    http.expectOne('/assets/i18n/en.json').flush({});
    http.expectOne('http://localhost:8080/api/auth/me').flush({
      farmerId: 42,
      fullName: 'Test Farmer',
      mobileNumber: '9876543210',
      email: null,
      village: 'Test Village',
      taluka: 'Test Taluka',
      district: 'Banaskantha',
      state: 'Gujarat',
      preferredLanguage: 'en'
    });
    http.expectOne('/assets/i18n/en.json').flush({});

    const conversations = http.expectOne('http://localhost:8080/api/ai/conversations');
    expect(conversations.request.method).toBe('GET');
    conversations.flush([]);
    await fixture.whenStable();
    fixture.detectChanges();
    http.verify();
  });
});
