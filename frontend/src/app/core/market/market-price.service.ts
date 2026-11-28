import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';

export interface MarketPrice {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string;
  minPrice: number | null;
  maxPrice: number | null;
  modalPrice: number | null;
}

@Injectable({ providedIn: 'root' })
export class MarketPriceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(AppConfigService).marketPricesUrl;

  search(commodity: string, state: string, district: string, market: string): Observable<MarketPrice[]> {
    let params = new HttpParams()
      .set('commodity', commodity)
      .set('state', state);
    if (district.trim()) params = params.set('district', district.trim());
    if (market.trim()) params = params.set('market', market.trim());
    return this.http.get<MarketPrice[]>(this.apiUrl, { params });
  }
}
