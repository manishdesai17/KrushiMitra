import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  weatherCode: number;
  windSpeed: number;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);

  current(latitude: number, longitude: number): Observable<CurrentWeather> {
    return this.http.get<OpenMeteoResponse>('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: String(latitude),
        longitude: String(longitude),
        current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
        timezone: 'auto'
      }
    }).pipe(map(response => ({
      temperature: response.current.temperature_2m,
      feelsLike: response.current.apparent_temperature,
      humidity: response.current.relative_humidity_2m,
      weatherCode: response.current.weather_code,
      windSpeed: response.current.wind_speed_10m
    })));
  }
}
