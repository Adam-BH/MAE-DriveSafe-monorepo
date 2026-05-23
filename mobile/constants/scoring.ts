export const WEIGHTS = {
  phone: 0.25,
  braking: 0.20,
  speeding: 0.20,
  cornering: 0.15,
  night: 0.10,
  hours: 0.10,
} as const;

export const THRESHOLDS = {
  harshBrakeG: 0.8,
  harshAccelG: 0.7,
  sharpCornerDeg: 45,
  phoneMoveAngleDeg: 45,
  phoneUseSpeedKmh: 20,
  speedingKmh: 0,
} as const;
