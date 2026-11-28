export type CropStage =
  | 'planned'
  | 'emergence'
  | 'vegetative'
  | 'flowering'
  | 'development'
  | 'tuberGrowth'
  | 'maturity'
  | 'harvest';

export function normalizeCropCycleDays(value: number | undefined): number {
  return Number.isInteger(value) && value !== undefined && value >= 1 && value <= 365
    ? value
    : 90;
}

export function cropDayForDate(sowingDate: string, today = new Date()): number {
  const sowingTime = parseDate(sowingDate);
  if (sowingTime === null) return 0;

  const todayTime = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(0, Math.floor((todayTime - sowingTime) / 86_400_000) + 1);
}

export function cropDateForDay(sowingDate: string, day: number): string {
  const sowingTime = parseDate(sowingDate);
  if (sowingTime === null || !Number.isInteger(day) || day < 1) return '';

  const date = new Date(sowingTime + (day - 1) * 86_400_000);
  if (Number.isNaN(date.getTime()) || date.getUTCFullYear() > 9999) return '';
  return date.toISOString().slice(0, 10);
}

export function cropStageForDay(cropName: string, day: number, cycleDays: number): CropStage {
  if (day < 1) return 'planned';
  const progress = Math.min(1, day / normalizeCropCycleDays(cycleDays));
  if (progress <= 0.15) return 'emergence';
  if (progress <= 0.35) return 'vegetative';

  if (isPotato(cropName)) {
    if (progress <= 0.82) return 'tuberGrowth';
    if (progress <= 0.95) return 'maturity';
    return 'harvest';
  }

  if (progress <= 0.58) return 'vegetative';
  if (progress <= 0.76) return 'flowering';
  if (progress <= 0.92) return 'development';
  if (progress < 1) return 'maturity';
  return 'harvest';
}

function isPotato(cropName: string): boolean {
  const crop = cropName.trim().toLocaleLowerCase();
  return crop.includes('potato') || crop.includes('બટાક') || crop.includes('आलू');
}

function parseDate(value: string): number | null {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!parts) return null;

  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);
  return date.getUTCFullYear() === year
      && date.getUTCMonth() === month - 1
      && date.getUTCDate() === day
    ? time
    : null;
}
