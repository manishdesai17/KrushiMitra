import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService, FarmerProfile } from '../auth/auth.service';
import { FarmerDataStorageService } from './farmer-data-storage.service';

describe('FarmerDataStorageService', () => {
  const farmer = signal<FarmerProfile | null>(null);

  beforeEach(() => {
    farmer.set({
      farmerId: 101,
      fullName: 'First Farmer',
      mobileNumber: '9876543210',
      email: null,
      village: 'Village One',
      taluka: 'Taluka One',
      district: 'District One',
      state: 'Gujarat',
      preferredLanguage: 'en'
    });
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{
        provide: AuthService,
        useValue: { farmer: farmer.asReadonly() }
      }]
    });
  });

  it('keeps records separate when the signed-in farmer changes', () => {
    const storage = TestBed.inject(FarmerDataStorageService);
    localStorage.setItem('km-user:101:km-farms', JSON.stringify([{ name: 'First farm' }]));
    localStorage.setItem('km-user:202:km-farms', JSON.stringify([{ name: 'Second farm' }]));

    expect(storage.read<{ name: string }[]>('km-farms', [])).toEqual([{ name: 'First farm' }]);

    farmer.set({
      farmerId: 202,
      fullName: 'Second Farmer',
      mobileNumber: '9876543211',
      email: null,
      village: 'Village Two',
      taluka: 'Taluka Two',
      district: 'District Two',
      state: 'Gujarat',
      preferredLanguage: 'en'
    });
    expect(storage.read<{ name: string }[]>('km-farms', [])).toEqual([{ name: 'Second farm' }]);
  });

  it('migrates existing browser data to the first signed-in account once', () => {
    const storage = TestBed.inject(FarmerDataStorageService);
    localStorage.setItem('km-farms', JSON.stringify([{ name: 'Saved farm' }]));

    expect(storage.read<{ name: string }[]>('km-farms', [])).toEqual([{ name: 'Saved farm' }]);
    expect(localStorage.getItem('km-user:101:km-farms')).toBe('[{"name":"Saved farm"}]');
    expect(localStorage.getItem('km-farms')).toBeNull();
  });
});
