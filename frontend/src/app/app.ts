import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  LucideActivity,
  LucideArrowLeft,
  LucideArrowRight,
  LucideArrowUpRight,
  LucideBell,
  LucideCalendarDays,
  LucideCheck,
  LucideCloudOff,
  LucideCloudSun,
  LucideDroplets,
  LucideHouse,
  LucideLeaf,
  LucideLogOut,
  LucideMap,
  LucideMic,
  LucideImage,
  LucidePause,
  LucidePlay,
  LucideSquare,
  LucideVolume2,
  LucideMapPin,
  LucideMenu,
  LucideMessageCircleMore,
  LucideNotebookPen,
  LucidePencil,
  LucidePlus,
  LucideSearch,
  LucideSend,
  LucideShieldCheck,
  LucideSprout,
  LucideTrash,
  LucideUsers,
  LucideWheat,
  LucideX
} from '@lucide/angular';
import { AuthService } from './core/auth/auth.service';
import { LanguageCode, LanguageService } from './core/i18n/language.service';
import { AuthScreenComponent } from './features/auth/auth-screen.component';
import { FarmerLocation, FarmerLocationFieldsComponent } from './features/auth/farmer-location-fields.component';
import { AiConversation, AssistantService } from './core/assistant/assistant.service';
import { SpeechService } from './core/assistant/speech.service';
import { AppConfigService } from './core/config/app-config.service';
import { CurrentWeather, WeatherService } from './core/weather/weather.service';
import { FarmerDataStorageService } from './core/storage/farmer-data-storage.service';
import {
  cropDateForDay,
  cropDayForDate,
  cropStageForDay,
  normalizeCropCycleDays,
  type CropStage
} from './core/crops/crop-lifecycle';
import { MarketPrice, MarketPriceService } from './core/market/market-price.service';
import { CropGrowthIllustrationComponent } from './features/crops/crop-growth-illustration.component';

type Page = 'dashboard' | 'farms' | 'crops' | 'activities' | 'assistant' | 'farmers'
  | 'weather' | 'market' | 'crop-health' | 'reports' | 'profile' | 'crop-report';
type AreaUnit = 'એકર' | 'હેક્ટર';

interface FarmRecord {
  id: number;
  name: string;
  village: string;
  area: number;
  unit: AreaUnit;
  soil: string;
  irrigation: string;
}

interface CropRecord {
  id: number;
  farmName: string;
  name: string;
  variety: string;
  sowingDate: string;
  cycleDays?: number;
  status: string;
}

interface ActivityRecord {
  id: number;
  cropName: string;
  type: string;
  date: string;
  description: string;
}

interface FarmerRecord {
  farmerId: number;
  fullName: string;
  mobileNumber: string;
  email: string | null;
  village: string;
  taluka: string;
  district: string;
  state: string;
}

interface FarmerDraft {
  fullName: string;
  mobileNumber: string;
  email: string;
  password: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
}

interface ChatMessage {
  role: 'farmer' | 'assistant';
  text: string;
}

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    AuthScreenComponent,
    FarmerLocationFieldsComponent,
    CropGrowthIllustrationComponent,
    LucideActivity,
    LucideArrowLeft,
    LucideArrowRight,
    LucideArrowUpRight,
    LucideBell,
    LucideCalendarDays,
    LucideCheck,
    LucideCloudOff,
    LucideCloudSun,
    LucideDroplets,
    LucideHouse,
    LucideLeaf,
    LucideLogOut,
    LucideMap,
    LucideMic,
    LucideImage,
    LucidePause,
    LucidePlay,
    LucideSquare,
    LucideVolume2,
    LucideMapPin,
    LucideMenu,
    LucideMessageCircleMore,
    LucideNotebookPen,
    LucidePencil,
    LucidePlus,
    LucideSearch,
    LucideSend,
    LucideShieldCheck,
    LucideSprout,
    LucideTrash,
    LucideUsers,
    LucideWheat,
    LucideX
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly auth = inject(AuthService);
  protected readonly language = inject(LanguageService);
  private readonly apiUrl = inject(AppConfigService).farmersUrl;
  private readonly assistant = inject(AssistantService);
  private readonly speech = inject(SpeechService);
  private readonly weatherService = inject(WeatherService);
  private readonly farmerStorage = inject(FarmerDataStorageService);
  private readonly marketPriceService = inject(MarketPriceService);

  protected readonly isReady = signal(false);
  protected readonly showWelcomeScreen = signal(false);
  protected readonly welcomeLanguage = signal<LanguageCode>(this.language.language());
  protected readonly languageChoiceSaving = signal(false);
  protected readonly activePage = signal<Page>('dashboard');
  protected readonly pageTitle = computed(() => this.language.translate(`page.${this.activePage()}`));
  protected readonly today = computed(() => new Intl.DateTimeFormat(this.language.locale(), {
    weekday: 'long', month: 'long', day: 'numeric'
  }).format(new Date()));
  protected readonly activeCropCount = computed(() =>
    this.crops().filter(crop => crop.status !== 'લણણી પૂર્ણ').length
  );
  protected readonly todayActivityCount = computed(() => {
    return this.activities().filter(activity => activity.date === this.localDateString()).length;
  });
  protected readonly dashboardCrop = computed(() => {
    const crops = this.crops();
    return crops.length === 0 ? null : crops[this.cropCarouselIndex() % crops.length];
  });
  protected readonly selectedCrop = computed(() =>
    this.crops().find(crop => crop.id === this.selectedCropId()) ?? null
  );

  protected readonly farms = signal<FarmRecord[]>([]);
  protected readonly crops = signal<CropRecord[]>([]);
  protected readonly activities = signal<ActivityRecord[]>([]);
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly farmers = signal<FarmerRecord[]>([]);
  protected readonly farmerLoading = signal(false);
  protected readonly farmerSaving = signal(false);
  protected readonly farmerError = signal('');
  protected readonly farmerMessage = signal('');
  protected readonly farmerDialogOpen = signal(false);
  protected farmerAiNoticeAccepted = false;
  protected readonly farmerEditId = signal<number | null>(null);
  protected readonly localDialog = signal<'farm' | 'crop' | 'activity' | null>(null);
  protected readonly localEditId = signal<number | null>(null);
  protected readonly chatDraft = signal('');
  protected readonly conversations = signal<AiConversation[]>([]);
  protected readonly selectedConversationId = signal<number | null>(null);
  protected readonly selectedImage = signal<File | null>(null);
  protected readonly imagePreview = signal<string | null>(null);
  protected readonly recording = signal(false);
  protected readonly voiceStatus = signal('');
  protected readonly assistantLoading = signal(false);
  protected readonly speaking = signal(false);
  protected readonly searchText = signal('');
  protected readonly cropSearchText = signal('');
  protected readonly cropStatusFilter = signal('');
  protected readonly activitySearchText = signal('');
  protected readonly activityDateFilter = signal<'all' | '30' | '90'>('all');
  protected readonly reportPeriod = signal<'30' | '90'>('30');
  protected readonly mobileNavOpen = signal(false);
  protected readonly weather = signal<CurrentWeather | null>(null);
  protected readonly weatherLoading = signal(false);
  protected readonly weatherError = signal('');
  protected readonly healthCrop = signal('');
  protected readonly healthSymptoms = signal('');
  protected readonly cropCarouselIndex = signal(0);
  protected readonly selectedCropId = signal<number | null>(null);
  protected readonly cropReportReturnPage = signal<Page>('dashboard');
  protected readonly selectedTimelineDay = signal(0);
  protected readonly marketCommodity = signal('Potato');
  protected readonly marketState = signal('');
  protected readonly marketDistrict = signal('');
  protected readonly marketName = signal('');
  protected readonly marketPrices = signal<MarketPrice[]>([]);
  protected readonly marketLoading = signal(false);
  protected readonly marketError = signal('');

  protected farmDraft = this.emptyFarm();
  protected cropDraft = this.emptyCrop();
  protected activityDraft = this.emptyActivity();
  protected farmerDraft = this.emptyFarmer();
  protected readonly farmerLocationDraft = signal<FarmerLocation>(this.emptyLocation());

  protected readonly filteredFarms = computed(() => {
    const search = this.searchText().trim().toLocaleLowerCase();
    if (!search) return this.farms();
    return this.farms().filter(farm => `${farm.name} ${farm.village}`.toLocaleLowerCase().includes(search));
  });
  protected readonly filteredCrops = computed(() => {
    const search = this.cropSearchText().trim().toLocaleLowerCase();
    const status = this.cropStatusFilter();
    return this.crops().filter(crop =>
      (!status || crop.status === status)
      && (!search || `${crop.name} ${crop.variety} ${crop.farmName}`.toLocaleLowerCase().includes(search))
    );
  });
  protected readonly filteredActivities = computed(() => {
    const search = this.activitySearchText().trim().toLocaleLowerCase();
    const dateFilter = this.activityDateFilter();
    const cutoff = dateFilter === 'all' ? null : new Date();
    if (cutoff) cutoff.setDate(cutoff.getDate() - Number(dateFilter));
    return this.activities().filter(activity => {
      const activityDate = new Date(`${activity.date}T00:00:00`);
      return (!search || `${activity.cropName} ${activity.type} ${activity.description}`.toLocaleLowerCase().includes(search))
        && (!cutoff || activityDate >= cutoff);
    });
  });
  protected readonly reportActivityCount = computed(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(this.reportPeriod()));
    return this.activities().filter(activity => new Date(`${activity.date}T00:00:00`) >= cutoff).length;
  });

  ngOnInit(): void {
    void this.initializeApplication();
  }

  protected t(key: string): string {
    return this.language.translate(key);
  }

  protected onAuthenticated(): void {
    this.loadFarmerLocalData();
    this.isReady.set(true);
    this.showWelcomeScreen.set(false);
    this.activePage.set('dashboard');
    if (this.messages().length === 0) this.clearChat();
    this.auth.restoreSession().subscribe(() => {
      if (this.auth.isAuthenticated()) this.loadConversations();
    });
  }

  protected welcomeLanguageChanged(language: LanguageCode): void {
    this.welcomeLanguage.set(language);
    void this.language.setLanguage(language);
  }

  protected async startWelcome(): Promise<void> {
    if (this.languageChoiceSaving()) return;
    this.languageChoiceSaving.set(true);
    try {
      await this.language.setLanguage(this.welcomeLanguage());
      this.showWelcomeScreen.set(false);
      this.isReady.set(true);
    } finally {
      this.languageChoiceSaving.set(false);
    }
  }

  protected changeLanguage(language: LanguageCode): void {
    void this.language.setLanguage(language);
    if (!this.auth.isAuthenticated()) return;
    this.auth.updateLanguage(language).subscribe({
      error: () => this.farmerError.set(this.t('profile.languageSaved'))
    });
  }

  protected logout(): void {
    this.auth.logout();
    this.farms.set([]);
    this.crops.set([]);
    this.activities.set([]);
    this.messages.set([]);
    this.showWelcomeScreen.set(true);
    this.activePage.set('dashboard');
  }

  protected displayUnit(unit: AreaUnit): string {
    return this.t(unit === 'એકર' ? 'unit.acre' : 'unit.hectare');
  }

  protected displayStatus(status: string): string {
    const key: Record<string, string> = {
      'વાવણીનું આયોજન': 'status.planned',
      'વાવણી થઈ': 'status.sown',
      'વૃદ્ધિમાં': 'status.growing',
      'લણણી માટે તૈયાર': 'status.ready',
      'લણણી પૂર્ણ': 'status.harvested'
    };
    return this.t(key[status] ?? status);
  }

  protected displayActivity(type: string): string {
    const key: Record<string, string> = {
      'સિંચાઈ': 'activity.irrigation',
      'ખાતર આપ્યું': 'activity.fertilizer',
      'જંતુનાશકનો ઉપયોગ': 'activity.pesticide',
      'વાવણી': 'activity.sowing',
      'નીંદામણ': 'activity.weeding',
      'લણણી': 'activity.harvesting',
      'અન્ય': 'activity.other'
    };
    return this.t(key[type] ?? type);
  }

  protected displayIrrigation(type: string): string {
    const key: Record<string, string> = {
      'ટપક સિંચાઈ': 'irrigation.drip',
      'ફુવારા સિંચાઈ': 'irrigation.sprinkler',
      'નહેર': 'irrigation.canal',
      'વરસાદ આધારિત': 'irrigation.rain',
      'અન્ય': 'irrigation.other'
    };
    return this.t(key[type] ?? type);
  }

  protected displaySoil(type: string): string {
    return this.t(type === 'કાળી' ? 'soil.black' : type || 'common.notConnected');
  }

  protected setPage(page: Page): void {
    this.activePage.set(page);
    this.mobileNavOpen.set(false);
    if (page === 'farmers') this.loadFarmers();
    if (page === 'market') {
      const farmer = this.auth.farmer();
      if (!this.marketState()) this.marketState.set(farmer?.state || 'Gujarat');
      if (!this.marketDistrict() && farmer?.district) this.marketDistrict.set(farmer.district);
      this.searchMarketPrices();
    }
  }

  protected cycleDays(crop: CropRecord): number {
    return normalizeCropCycleDays(crop.cycleDays);
  }

  protected currentCropDay(crop: CropRecord): number {
    return Math.min(cropDayForDate(crop.sowingDate), this.cycleDays(crop));
  }

  protected cropStage(crop: CropRecord, day = this.currentCropDay(crop)): CropStage {
    return cropStageForDay(crop.name, day, this.cycleDays(crop));
  }

  protected cropStageLabel(crop: CropRecord, day = this.currentCropDay(crop)): string {
    return this.t(`crop.stage.${this.cropStage(crop, day)}`);
  }

  protected cropTip(crop: CropRecord, day = this.currentCropDay(crop)): string {
    const stage = this.cropStage(crop, day);
    const tipKey = stage === 'flowering' ? 'reproductive' : stage;
    return this.t(`crop.tip.${tipKey}`);
  }

  protected cropProgress(crop: CropRecord, day = this.currentCropDay(crop)): number {
    return Math.round(day / this.cycleDays(crop) * 100);
  }

  protected cropDateLabel(crop: CropRecord, day: number): string {
    const date = cropDateForDay(crop.sowingDate, day);
    if (!date) return this.t('crop.stage.planned');
    return new Intl.DateTimeFormat(this.language.locale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(`${date}T00:00:00Z`));
  }

  protected openCropTimeline(crop: CropRecord): void {
    if (!crop.sowingDate) {
      this.openCropDialog(crop);
      return;
    }
    this.cropReportReturnPage.set(this.activePage());
    this.selectedCropId.set(crop.id);
    this.selectedTimelineDay.set(this.currentCropDay(crop));
    this.setPage('crop-report');
  }

  protected closeCropTimeline(): void {
    this.setPage(this.cropReportReturnPage());
  }

  protected setTimelineDay(event: Event): void {
    const crop = this.selectedCrop();
    const input = event.target as HTMLInputElement;
    if (!crop) return;
    const day = Number(input.value);
    if (!Number.isFinite(day)) return;
    this.selectedTimelineDay.set(Math.min(Math.max(0, day), this.cycleDays(crop)));
  }

  protected moveCropCarousel(direction: -1 | 1): void {
    const count = this.crops().length;
    if (count < 2) return;
    this.cropCarouselIndex.update(index => (index + direction + count) % count);
  }

  protected searchMarketPrices(): void {
    const commodity = this.marketCommodity().trim();
    if (!commodity) {
      this.marketPrices.set([]);
      this.marketError.set(this.t('market.commodityRequired'));
      return;
    }

    this.marketLoading.set(true);
    this.marketError.set('');
    this.marketPrices.set([]);
    this.marketPriceService.search(
      commodity,
      this.marketState().trim() || 'Gujarat',
      this.marketDistrict(),
      this.marketName()
    ).subscribe({
      next: prices => {
        this.marketPrices.set(prices);
        this.marketLoading.set(false);
      },
      error: response => {
        this.marketLoading.set(false);
        this.marketError.set(response.status === 503
          ? this.t('market.setupRequired')
          : this.t('market.fetchFailed'));
      }
    });
  }

  protected weatherCondition(): string {
    const code = this.weather()?.weatherCode;
    if (code === undefined) return '';
    if (code === 0) return this.t('weather.clear');
    if (code === 1 || code === 2) return this.t('weather.partlyCloudy');
    if (code === 3) return this.t('weather.cloudy');
    if (code === 45 || code === 48) return this.t('weather.fog');
    if (code >= 51 && code <= 57) return this.t('weather.drizzle');
    if (code >= 61 && code <= 67) return this.t('weather.rain');
    if (code >= 71 && code <= 77 || code >= 85 && code <= 86) return this.t('weather.snow');
    if (code >= 80 && code <= 82) return this.t('weather.showers');
    if (code >= 95) return this.t('weather.storm');
    return this.t('weather.partlyCloudy');
  }

  protected requestWeather(): void {
    if (!navigator.geolocation) {
      this.weatherError.set(this.t('weather.locationUnavailable'));
      return;
    }
    this.weatherLoading.set(true);
    this.weatherError.set('');
    navigator.geolocation.getCurrentPosition(
      position => this.weatherService.current(position.coords.latitude, position.coords.longitude)
        .subscribe({
          next: current => {
            this.weather.set(current);
            this.weatherLoading.set(false);
          },
          error: () => {
            this.weatherLoading.set(false);
            this.weatherError.set(this.t('weather.fetchFailed'));
          }
        }),
      error => {
        this.weatherLoading.set(false);
        this.weatherError.set(error.code === error.PERMISSION_DENIED
          ? this.t('weather.locationDenied')
          : error.code === error.TIMEOUT
            ? this.t('weather.locationTimeout')
            : this.t('weather.locationUnavailable'));
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
    );
  }

  protected openCropHealthAssistant(form: NgForm): void {
    if (form.invalid) return;
    this.chatDraft.set(
      `${this.t('cropHealth.assistantRequest')} ${this.t('cropHealth.crop')}: ${this.healthCrop()}. ${this.t('cropHealth.symptoms')}: ${this.healthSymptoms()}`
    );
    this.setPage('assistant');
  }

  protected openFarmDialog(farm?: FarmRecord): void {
    this.localEditId.set(farm?.id ?? null);
    this.farmDraft = farm ? { ...farm } : this.emptyFarm();
    this.localDialog.set('farm');
  }

  protected openCropDialog(crop?: CropRecord): void {
    this.localEditId.set(crop?.id ?? null);
    this.cropDraft = crop
      ? { ...crop, cycleDays: normalizeCropCycleDays(crop.cycleDays) }
      : this.emptyCrop();
    this.localDialog.set('crop');
  }

  protected openActivityDialog(activity?: ActivityRecord): void {
    this.localEditId.set(activity?.id ?? null);
    this.activityDraft = activity ? { ...activity } : this.emptyActivity();
    this.localDialog.set('activity');
  }

  protected saveFarm(): void {
    const id = this.localEditId() ?? Date.now();
    this.persistList('km-farms', this.farms, this.farmDraft, id);
    this.localDialog.set(null);
  }

  protected saveCrop(): void {
    const id = this.localEditId() ?? Date.now();
    this.persistList('km-crops', this.crops, {
      ...this.cropDraft,
      cycleDays: normalizeCropCycleDays(this.cropDraft.cycleDays)
    }, id);
    this.localDialog.set(null);
  }

  protected saveActivity(): void {
    const id = this.localEditId() ?? Date.now();
    this.persistList('km-activities', this.activities, this.activityDraft, id);
    this.localDialog.set(null);
  }

  protected deleteFarm(id: number): void {
    this.farms.update(items => items.filter(item => item.id !== id));
    this.farmerStorage.write('km-farms', this.farms());
  }

  protected deleteCrop(id: number): void {
    this.crops.update(items => items.filter(item => item.id !== id));
    this.farmerStorage.write('km-crops', this.crops());
  }

  protected deleteActivity(id: number): void {
    this.activities.update(items => items.filter(item => item.id !== id));
    this.farmerStorage.write('km-activities', this.activities());
  }

  protected openFarmerDialog(farmer?: FarmerRecord): void {
    this.farmerEditId.set(farmer?.farmerId ?? null);
    this.farmerAiNoticeAccepted = false;
    this.farmerLocationDraft.set(farmer ? {
      state: farmer.state,
      district: farmer.district,
      taluka: farmer.taluka,
      village: farmer.village
    } : this.emptyLocation());
    this.farmerDraft = farmer ? {
      fullName: farmer.fullName,
      mobileNumber: farmer.mobileNumber,
      email: farmer.email ?? '',
      password: '',
      village: farmer.village,
      taluka: farmer.taluka,
      district: farmer.district,
      state: farmer.state
    } : this.emptyFarmer();
    this.farmerError.set('');
    this.farmerDialogOpen.set(true);
  }

  protected saveFarmer(form: NgForm): void {
    if (form.invalid || this.farmerSaving()) return;
    this.farmerSaving.set(true);
    this.farmerError.set('');
    const id = this.farmerEditId();
    const { password, ...profile } = this.farmerDraft;
    const requestBody = { ...profile, ...this.farmerLocationDraft() };
    const request = id
      ? this.http.put<FarmerRecord>(`${this.apiUrl}/${id}`, requestBody)
      : this.http.post<FarmerRecord>(this.apiUrl, { ...requestBody, password });

    request.subscribe({
      next: () => {
        this.farmerSaving.set(false);
        this.farmerDialogOpen.set(false);
        this.farmerMessage.set(id ? this.t('farmer.updated') : this.t('farmer.registered'));
        this.loadFarmers();
        setTimeout(() => this.farmerMessage.set(''), 3500);
      },
      error: (error: HttpErrorResponse) => {
        this.farmerSaving.set(false);
        this.farmerError.set(error.status === 0
          ? this.t('farmer.error.server')
          : error.error?.detail ?? this.t('farmer.error.save'));
      }
    });
  }

  protected deleteFarmer(farmer: FarmerRecord): void {
    if (!confirm(`${farmer.fullName}: ${this.t('farmer.deleteConfirm')}`)) return;
    this.http.delete(`${this.apiUrl}/${farmer.farmerId}`).subscribe({
      next: () => this.loadFarmers(),
      error: () => this.farmerError.set(this.t('farmer.deleteError'))
    });
  }

  protected loadFarmers(): void {
    this.farmerLoading.set(true);
    this.farmerError.set('');
    this.http.get<FarmerRecord[]>(this.apiUrl).subscribe({
      next: (farmers: FarmerRecord[]) => {
        this.farmers.set(farmers);
        this.farmerLoading.set(false);
      },
      error: () => {
        this.farmerLoading.set(false);
        this.farmerError.set(this.t('farmer.listError'));
      }
    });
  }

  protected sendMessage(): void {
    const text = this.chatDraft().trim();
    if (!text || this.assistantLoading()) return;

    const userMessage: ChatMessage = { role: 'farmer', text };
    const nextMessages = [...this.messages(), userMessage];
    this.messages.set(nextMessages);
    this.farmerStorage.write('km-chat', nextMessages);
    this.chatDraft.set('');
    this.assistantLoading.set(true);

    const send = (conversationId: number) => {
      this.assistant.send(conversationId, text, this.language.language(), this.selectedImage() ?? undefined).subscribe({
        next: response => {
          const reply: ChatMessage = { role: 'assistant', text: response.content };
          const updated = [...this.messages(), reply];
          this.messages.set(updated);
          this.farmerStorage.write('km-chat', updated);
          this.assistantLoading.set(false);
          this.removeSelectedImage();
          this.loadConversations();
        },
        error: () => {
          const reply: ChatMessage = { role: 'assistant', text: this.t('assistant.safeFollowup') };
          const updated = [...this.messages(), reply];
          this.messages.set(updated);
          this.farmerStorage.write('km-chat', updated);
          this.assistantLoading.set(false);
        }
      });
    };

    if (this.selectedConversationId()) {
      send(this.selectedConversationId()!);
      return;
    }

    this.assistant.create(text.slice(0, 80), this.language.language()).subscribe({
      next: conversation => {
        this.selectedConversationId.set(conversation.conversationId);
        send(conversation.conversationId);
      },
      error: () => {
        const reply: ChatMessage = { role: 'assistant', text: this.t('assistant.safeFollowup') };
        const updated = [...this.messages(), reply];
        this.messages.set(updated);
        this.farmerStorage.write('km-chat', updated);
        this.assistantLoading.set(false);
      }
    });
  }

  protected newConversation(): void {
    this.selectedConversationId.set(null);
    this.clearChat();
  }

  protected loadConversations(): void {
    if (!this.auth.isAuthenticated()) return;
    this.assistant.list().subscribe({
      next: conversations => this.conversations.set(conversations),
      error: () => this.conversations.set([])
    });
  }

  protected openConversation(conversation: AiConversation): void {
    this.assistant.open(conversation.conversationId).subscribe({
      next: opened => {
        this.selectedConversationId.set(opened.conversationId);
        this.messages.set(opened.messages.map(message => ({
          role: message.sender === 'FARMER' ? 'farmer' as const : 'assistant' as const,
          text: message.content
        })));
      }
    });
  }

  protected deleteConversation(conversation: AiConversation): void {
    this.assistant.delete(conversation.conversationId).subscribe({
      next: () => {
        if (this.selectedConversationId() === conversation.conversationId) this.newConversation();
        this.loadConversations();
      }
    });
  }

  protected startRecording(): void {
    if (this.recording()) {
      this.speech.stop();
      this.recording.set(false);
      return;
    }
    this.recording.set(true);
    this.voiceStatus.set(this.t('assistant.listening'));
    this.speech.start(text => {
      this.chatDraft.set(text);
      this.voiceStatus.set(this.t('assistant.voiceReady'));
    }, error => {
      this.recording.set(false);
      this.voiceStatus.set(error);
    }, () => {
      this.recording.set(false);
    });
  }

  protected selectImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      this.voiceStatus.set(this.t('assistant.imageTypeError'));
      input.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.voiceStatus.set(this.t('assistant.imageSizeError'));
      input.value = '';
      return;
    }
    this.selectedImage.set(file);
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(String(reader.result));
    reader.readAsDataURL(file);
  }

  protected removeSelectedImage(): void {
    this.selectedImage.set(null);
    this.imagePreview.set(null);
  }

  protected speakLatest(): void {
    const latest = [...this.messages()].reverse().find(message => message.role === 'assistant');
    if (!latest) return;
    this.speaking.set(true);
    this.speech.speak(latest.text, () => this.speaking.set(false));
  }

  protected pauseSpeech(): void {
    this.speech.pause();
  }

  protected resumeSpeech(): void {
    this.speech.resume();
  }

  protected stopSpeech(): void {
    this.speech.stopSpeaking();
    this.speaking.set(false);
  }

  protected clearChat(): void {
    const welcome = [{
      role: 'assistant' as const,
      text: this.t('assistant.welcome')
    }];
    this.messages.set(welcome);
    this.farmerStorage.write('km-chat', welcome);
  }

  protected usePrompt(prompt: string): void {
    this.chatDraft.set(prompt);
  }

  private persistList<T extends { id: number }>(
    key: string,
    store: ReturnType<typeof signal<T[]>>,
    draft: Omit<T, 'id'> | T,
    id: number
  ): void {
    const current = store();
    const record = { ...draft, id } as T;
    const updated = current.some(item => item.id === id)
      ? current.map(item => item.id === id ? record : item)
      : [record, ...current];
    store.set(updated);
    this.farmerStorage.write(key, updated);
  }

  private async initializeApplication(): Promise<void> {
    await this.language.initialize();
    this.welcomeLanguage.set(this.language.language());
    if (!this.auth.token()) {
      this.showWelcomeScreen.set(true);
      this.isReady.set(true);
      return;
    }
    this.restoreSession();
  }

  private restoreSession(): void {
    this.auth.restoreSession().subscribe(() => {
      if (this.auth.isAuthenticated()) {
        this.loadFarmerLocalData();
        if (this.messages().length === 0) this.clearChat();
        this.loadConversations();
      } else {
        this.farms.set([]);
        this.crops.set([]);
        this.activities.set([]);
        this.messages.set([]);
        this.showWelcomeScreen.set(true);
      }
      this.isReady.set(true);
    });
  }

  private loadFarmerLocalData(): void {
    this.farms.set(this.farmerStorage.read('km-farms', []));
    this.crops.set(this.farmerStorage.read('km-crops', []));
    this.activities.set(this.farmerStorage.read('km-activities', []));
    this.messages.set(this.farmerStorage.read('km-chat', []));
  }

  private emptyLocation(): FarmerLocation {
    return { state: 'Gujarat', district: '', taluka: '', village: '' };
  }

  private emptyFarm(): Omit<FarmRecord, 'id'> {
    return { name: '', village: '', area: 0, unit: 'એકર', soil: '', irrigation: '' };
  }

  private emptyCrop(): Omit<CropRecord, 'id'> {
    return {
      farmName: '',
      name: '',
      variety: '',
      sowingDate: '',
      cycleDays: 90,
      status: 'વાવણીનું આયોજન'
    };
  }

  private emptyActivity(): Omit<ActivityRecord, 'id'> {
    return { cropName: '', type: 'સિંચાઈ', date: this.localDateString(), description: '' };
  }

  private localDateString(date = new Date()): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private emptyFarmer(): FarmerDraft {
    return {
      fullName: '', mobileNumber: '', email: '', password: '',
      village: '', taluka: '', district: '', state: 'Gujarat'
    };
  }
}