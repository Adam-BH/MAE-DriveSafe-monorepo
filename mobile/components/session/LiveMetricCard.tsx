import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

interface LiveMetricCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

export function LiveMetricCard({ label, value, sub, accent }: LiveMetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent ? { color: accent } : null]}>{value}</Text>
      {sub && <Text style={styles.sub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    margin: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  label: { fontSize: fontSize.small, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  value: { fontSize: fontSize.h2, fontWeight: '700', color: '#fff' },
  sub: { fontSize: fontSize.small, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
});
