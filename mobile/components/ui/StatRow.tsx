import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '../../lib/theme';

interface StatRowProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

export function StatRow({ label, value, sub, accent }: StatRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.right}>
        <Text style={[styles.value, accent && { color: colors.primary }]}>{value}</Text>
        {sub && <Text style={styles.sub}>{sub}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: { fontSize: fontSize.body, color: colors.textMuted, flex: 1 },
  right: { alignItems: 'flex-end' },
  value: { fontSize: fontSize.body, fontWeight: '600', color: colors.textPrimary },
  sub: { fontSize: fontSize.small, color: colors.textMuted },
});
