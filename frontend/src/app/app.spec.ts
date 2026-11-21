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

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should provide the app component for testing', () => {
    localStorage.removeItem('km-access-token');
    localStorage.removeItem('km-language');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http.match('/assets/i18n/gu.json').forEach(request => request.flush({
      'brand.name': 'કૃષિમિત્ર',
      'common.loading': 'લોડ થઈ રહ્યું છે...'
    }));

    expect(fixture.componentInstance).toBeTruthy();
    http.verify();
  });
});
