export const colors = {
  primary: '#2B3497',
  primaryDark: '#1e2470',
  secondary: '#4BBFA0',
  secondaryDark: '#3aaa8d',
  danger: '#ec6062',
  surface: '#f5f5f4',
  white: '#ffffff',
  textPrimary: '#1a1a2e',
  textMuted: 'rgba(26, 26, 46, 0.55)',
  border: 'rgba(43, 52, 151, 0.12)',
  scoreGreen: '#10B981',
  scoreAmber: '#F59E0B',
  scoreRed: '#EF4444',
} as const;

export const fonts = {
  heading: 'Montserrat_600SemiBold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
} as const;

export const fontSize = {
  display: 36,
  h1: 26,
  h2: 20,
  h3: 16,
  body: 14,
  small: 11,
} as const;

export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const shadow = {
  sm: {
    shadowColor: '#2B3497',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#2B3497',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

export function scoreColor(score: number): string {
  if (score >= 80) return colors.scoreGreen;
  if (score >= 50) return colors.scoreAmber;
  return colors.scoreRed;
}

export function discountTier(score: number): { pct: number; label: string } {
  if (score >= 80) return { pct: 15, label: 'Gold' };
  if (score >= 70) return { pct: 8, label: 'Silver' };
  if (score >= 50) return { pct: 3, label: 'Bronze' };
  return { pct: 0, label: 'None' };
}
