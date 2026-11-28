import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MarketPriceService } from './market-price.service';

describe('MarketPriceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
  });

  it('requests official prices with the selected commodity and location', () => {
    const service = TestBed.inject(MarketPriceService);
    const http = TestBed.inject(HttpTestingController);
    let result: unknown;

    service.search('Potato', 'Gujarat', 'Banaskantha', '').subscribe(value => result = value);
    const request = http.expectOne(request => request.url === 'http://localhost:8080/api/market/prices');
    expect(request.request.params.get('commodity')).toBe('Potato');
    expect(request.request.params.get('state')).toBe('Gujarat');
    expect(request.request.params.get('district')).toBe('Banaskantha');
    expect(request.request.params.has('market')).toBeFalse();
    request.flush([]);

    expect(result).toEqual([]);
    http.verify();
  });
});
