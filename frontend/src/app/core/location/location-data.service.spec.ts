import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LocationDataService } from './location-data.service';

describe('LocationDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
  });

  it('returns talukas and village suggestions for the selected Gujarat district', () => {
    const service = TestBed.inject(LocationDataService);
    const http = TestBed.inject(HttpTestingController);

    service.load();
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

    expect(service.talukasFor('Banaskantha').map(taluka => taluka.name)).toEqual(['Dhanera']);
    expect(service.settlementsFor('Banaskantha', 'Dhanera').map(place => place.name)).toEqual(['Vasan']);
    expect(service.settlementsFor('Banaskantha', 'Unknown')).toEqual([]);
    http.verify();
  });
});
