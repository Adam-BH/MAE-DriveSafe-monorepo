import { WEIGHTS } from '../constants/scoring';

export interface SessionState {
  phonePickups: number;
  phoneUseSec: number;
  harshBrakes: number;
  harshAccels: number;
  sharpCorners: number;
  speedingKm: number;
  totalKm: number;
  hasNightDriving: boolean;
  durationSec: number;
  weeklyHours: number;
}

export function computeLiveScore(state: SessionState): number {
  const {
    phonePickups,
    phoneUseSec,
    harshBrakes,
    harshAccels,
    sharpCorners,
    speedingKm,
    totalKm,
    hasNightDriving,
    durationSec,
    weeklyHours,
  } = state;

  const nightPct = hasNightDriving ? 50 : 0;
  const speedingPct = totalKm > 0 ? (speedingKm / totalKm) * 100 : 0;
  const brakesPer100 = totalKm > 0 ? ((harshBrakes + harshAccels) / totalKm) * 100 : 0;
  const cornersPer100 = totalKm > 0 ? (sharpCorners / totalKm) * 100 : 0;

  const phoneScore = clamp(100 - phonePickups * 4 - phoneUseSec * 0.08, 0, 100);
  const brakingScore = clamp(100 - brakesPer100 * 8, 0, 100);
  const speedingScore = clamp(100 - speedingPct * 1.5, 0, 100);
  const corneringScore = clamp(100 - cornersPer100 * 6, 0, 100);
  const nightScore = clamp(100 - nightPct * 0.4, 0, 100);
  const hoursScore = clamp(100 - Math.max(0, (weeklyHours - 20) * 2), 0, 100);

  const composite =
    phoneScore * WEIGHTS.phone +
    brakingScore * WEIGHTS.braking +
    speedingScore * WEIGHTS.speeding +
    corneringScore * WEIGHTS.cornering +
    nightScore * WEIGHTS.night +
    hoursScore * WEIGHTS.hours;

  return Math.round(clamp(composite, 0, 100));
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function scoreBreakdown(state: SessionState) {
  const { phonePickups, phoneUseSec, harshBrakes, harshAccels, sharpCorners, speedingKm, totalKm, hasNightDriving } = state;
  const brakesPer100 = totalKm > 0 ? ((harshBrakes + harshAccels) / totalKm) * 100 : 0;
  const cornersPer100 = totalKm > 0 ? (sharpCorners / totalKm) * 100 : 0;
  const speedingPct = totalKm > 0 ? (speedingKm / totalKm) * 100 : 0;
  const nightPct = hasNightDriving ? 50 : 0;

  return {
    phone: Math.round(clamp(100 - phonePickups * 4 - phoneUseSec * 0.08, 0, 100)),
    braking: Math.round(clamp(100 - brakesPer100 * 8, 0, 100)),
    speeding: Math.round(clamp(100 - speedingPct * 1.5, 0, 100)),
    cornering: Math.round(clamp(100 - cornersPer100 * 6, 0, 100)),
    night: Math.round(clamp(100 - nightPct * 0.4, 0, 100)),
  };
}

export function coachingTip(breakdown: ReturnType<typeof scoreBreakdown>): string {
  const worst = (Object.entries(breakdown) as [string, number][]).reduce(
    (a, b) => (b[1] < a[1] ? b : a)
  );
  const tips: Record<string, string> = {
    phone: 'Put your phone away while driving — even glancing at it triples crash risk.',
    braking: 'Ease off earlier — smooth braking saves fuel and improves your score.',
    speeding: 'Staying within speed limits cuts accident risk by up to 40%.',
    cornering: 'Slow down before corners, not during — your tyres will thank you.',
    night: 'Take extra care at night — reaction times are slower in low light.',
  };
  return tips[worst[0]] ?? 'Keep it up! Consistent safe driving earns bigger discounts.';
}
