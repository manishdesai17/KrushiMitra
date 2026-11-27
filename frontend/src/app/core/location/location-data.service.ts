import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

export interface LocationSettlement {
  name: string;
  type: 'Village' | 'Town';
}

export interface LocationTaluka {
  name: string;
  settlements: LocationSettlement[];
}

export interface LocationDistrict {
  name: string;
  talukas: LocationTaluka[];
}

interface GujaratLocationData {
  sourceYear: number;
  districts: LocationDistrict[];
}

@Injectable({ providedIn: 'root' })
export class LocationDataService {
  private readonly http = inject(HttpClient);
  private readonly state = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  private readonly districtData = signal<LocationDistrict[]>([]);

  readonly status = this.state.asReadonly();
  readonly districts = this.districtData.asReadonly();

  load(): void {
    if (this.state() !== 'idle') return;
    this.state.set('loading');
    this.http.get<GujaratLocationData>('/assets/data/gujarat-locations.json').subscribe({
      next: data => {
        this.districtData.set(data.districts);
        this.state.set('ready');
      },
      error: () => this.state.set('error')
    });
  }

  talukasFor(district: string): LocationTaluka[] {
    return this.districtData().find(item => item.name === district)?.talukas ?? [];
  }

  settlementsFor(district: string, taluka: string): LocationSettlement[] {
    return this.talukasFor(district).find(item => item.name === taluka)?.settlements ?? [];
  }
}
