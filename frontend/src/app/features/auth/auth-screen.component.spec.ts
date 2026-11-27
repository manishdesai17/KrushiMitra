import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthScreenComponent } from './auth-screen.component';

describe('AuthScreenComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthScreenComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('requires AI-response acknowledgement before allowing registration', async () => {
    const fixture = TestBed.createComponent(AuthScreenComponent);
    fixture.detectChanges();
    const registerToggle = fixture.nativeElement.querySelector('.auth-switch button') as HTMLButtonElement;
    registerToggle.click();
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/assets/data/gujarat-locations.json').flush({
      sourceYear: 2011,
      districts: [{
        name: 'Banaskantha',
        talukas: [{
          name: 'Dhanera',
          settlements: [{ name: 'Vasan', type: 'Village' }]
        }]
      }]
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const setInput = (selector: string, value: string): void => {
      const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();
    };
    setInput('input[name="fullName"]', 'Test Farmer');
    setInput('input[name="mobileNumber"]', '9876543210');
    setInput('input[name="password"]', 'password123');
    setInput('.location-fields .auth-field:nth-child(2) input', 'Banaskantha');
    setInput('.location-fields .auth-field:nth-child(3) input', 'Dhanera');
    setInput('.location-fields .auth-field:nth-child(4) input', 'Vasan');
    fixture.detectChanges();
    await fixture.whenStable();

    const submit = fixture.nativeElement.querySelector('.auth-submit') as HTMLButtonElement;
    expect(submit.disabled).toBeTrue();

    const acknowledgement = fixture.nativeElement.querySelector('input[name="aiNoticeAccepted"]') as HTMLInputElement;
    acknowledgement.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(submit.disabled).toBeFalse();
    http.verify();
  });
});
