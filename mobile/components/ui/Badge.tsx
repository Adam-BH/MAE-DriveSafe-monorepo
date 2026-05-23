import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, fontSize } from '../../lib/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'neutral';

const variantColors: Record<Variant, { bg: string; text: string }> = {
  primary: { bg: 'rgba(43,52,151,0.1)', text: colors.primary },
  secondary: { bg: 'rgba(75,191,160,0.1)', text: colors.secondaryDark },
  danger: { bg: 'rgba(236,96,98,0.1)', text: colors.danger },
  warning: { bg: '#FEF3C7', text: '#D97706' },
  success: { bg: '#D1FAE5', text: '#065F46' },
  neutral: { bg: '#F3F4F6', text: '#6B7280' },
};

interface BadgeProps {
  variant?: Variant;
  label: string;
}

export function Badge({ variant = 'neutral', label }: BadgeProps) {
  const c = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  text: { fontSize: fontSize.small, fontWeight: '600' },
});
