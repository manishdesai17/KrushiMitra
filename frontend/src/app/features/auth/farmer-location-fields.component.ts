import { Component, Input, forwardRef, inject, signal } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { LanguageService } from '../../core/i18n/language.service';
import { LocationDataService } from '../../core/location/location-data.service';

export interface FarmerLocation {
  state: string;
  district: string;
  taluka: string;
  village: string;
}

const INDIAN_STATES_AND_UTS = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

@Component({
  selector: 'app-farmer-location-fields',
  imports: [FormsModule],
  templateUrl: './farmer-location-fields.component.html',
  styleUrl: './farmer-location-fields.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FarmerLocationFieldsComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FarmerLocationFieldsComponent),
      multi: true
    }
  ]
})
export class FarmerLocationFieldsComponent implements ControlValueAccessor, Validator {
  @Input() listIdPrefix = 'farmer-location';

  protected readonly locationData = inject(LocationDataService);
  protected readonly language = inject(LanguageService);
  protected readonly states = INDIAN_STATES_AND_UTS;
  protected readonly value = signal<FarmerLocation>({
    state: 'Gujarat',
    district: '',
    taluka: '',
    village: ''
  });
  protected readonly disabled = signal(false);

  private onChange: (value: FarmerLocation) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  ngOnInit(): void {
    this.locationData.load();
  }

  protected t(key: string): string {
    return this.language.translate(key);
  }

  protected get districtListId(): string {
    return `${this.listIdPrefix}-districts`;
  }

  protected get talukaListId(): string {
    return `${this.listIdPrefix}-talukas`;
  }

  protected get villageListId(): string {
    return `${this.listIdPrefix}-villages`;
  }

  protected talukas(): string[] {
    return this.locationData.talukasFor(this.value().district).map(item => item.name);
  }

  protected villages(): string[] {
    return this.locationData
      .settlementsFor(this.value().district, this.value().taluka)
      .map(item => item.name);
  }

  protected changeState(state: string): void {
    this.update({ state, district: '', taluka: '', village: '' });
  }

  protected changeDistrict(district: string): void {
    this.update({ ...this.value(), district, taluka: '', village: '' });
  }

  protected changeTaluka(taluka: string): void {
    this.update({ ...this.value(), taluka, village: '' });
  }

  protected changeVillage(village: string): void {
    this.update({ ...this.value(), village });
  }

  writeValue(value: FarmerLocation | null): void {
    const next = value ? { ...value } : {
      state: 'Gujarat',
      district: '',
      taluka: '',
      village: ''
    };
    if (next.state === 'ગુજરાત') next.state = 'Gujarat';
    this.value.set(next);
  }

  registerOnChange(fn: (value: FarmerLocation) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  validate(_: AbstractControl): ValidationErrors | null {
    const value = this.value();
    return value.state.trim() && value.district.trim() && value.taluka.trim() && value.village.trim()
      ? null
      : { incompleteLocation: true };
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  private update(value: FarmerLocation): void {
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
    this.onValidatorChange();
  }
}
