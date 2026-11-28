import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
  });

  it('requests a current forecast for the supplied coordinates', () => {
    const service = TestBed.inject(WeatherService);
    const http = TestBed.inject(HttpTestingController);
    let result: unknown;

    service.current(24.17, 72.43).subscribe(value => result = value);
    const request = http.expectOne(request => request.url.startsWith('https://api.open-meteo.com/v1/forecast'));
    expect(request.request.params.get('latitude')).toBe('24.17');
    expect(request.request.params.get('longitude')).toBe('72.43');
    expect(request.request.params.get('timezone')).toBe('auto');
    request.flush({
      current: {
        temperature_2m: 31,
        apparent_temperature: 34,
        relative_humidity_2m: 45,
        weather_code: 2,
        wind_speed_10m: 12
      }
    });

    expect(result).toEqual({
      temperature: 31,
      feelsLike: 34,
      humidity: 45,
      weatherCode: 2,
      windSpeed: 12
    });
    http.verify();
  });
});
