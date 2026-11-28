import { cropDateForDay, cropDayForDate, cropStageForDay, normalizeCropCycleDays } from './crop-lifecycle';

describe('crop lifecycle helpers', () => {
  it('counts the sowing date as day one and advances by local calendar days', () => {
    expect(cropDayForDate('2026-11-27', new Date(2026, 10, 28, 12))).toBe(2);
    expect(cropDateForDay('2026-11-27', 2)).toBe('2026-11-28');
  });

  it('does not start a crop timeline for a future or malformed sowing date', () => {
    expect(cropDayForDate('2026-11-29', new Date(2026, 10, 28, 12))).toBe(0);
    expect(cropDayForDate('2026-02-30', new Date(2026, 10, 28, 12))).toBe(0);
    expect(cropDateForDay('2026-02-30', 1)).toBe('');
  });

  it('uses a potato-specific tuber stage and clamps the displayed cycle to harvest', () => {
    expect(cropStageForDay('Potato', 45, 90)).toBe('tuberGrowth');
    expect(cropStageForDay('Potato', 90, 90)).toBe('harvest');
  });

  it('keeps invalid cycle lengths within the supported default', () => {
    expect(normalizeCropCycleDays(undefined)).toBe(90);
    expect(normalizeCropCycleDays(500)).toBe(90);
  });
});
