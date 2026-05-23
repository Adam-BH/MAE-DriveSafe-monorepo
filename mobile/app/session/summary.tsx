import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScoreRing } from '../../components/session/ScoreRing';
import { Card } from '../../components/ui/Card';
import { ThemedText } from '../../components/ui/ThemedText';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { coachingTip } from '../../lib/scoring';

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

export default function Summary() {
  const router = useRouter();
  const { data: rawData } = useLocalSearchParams<{ data: string }>();
  const summary = rawData ? JSON.parse(rawData) : null;

  if (!summary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ThemedText variant="body">No session data</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const { tripScore, breakdown, distanceKm, durationSec, phoneUseSec, phonePickups, harshBrakes, sharpCorners } = summary;
  const tip = breakdown ? coachingTip(breakdown) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText variant="h2" style={{ textAlign: 'center', marginBottom: spacing.sm }}>
          Trip Complete
        </ThemedText>

        {/* Score */}
        <Card style={styles.scoreCard}>
          <ScoreRing score={tripScore ?? 0} size={160} />
          <ThemedText variant="h3" style={{ marginTop: spacing.sm, textAlign: 'center' }}>
            {tripScore >= 80 ? 'Excellent drive! 🏆' : tripScore >= 65 ? 'Good job 👍' : tripScore >= 50 ? 'Keep improving 📈' : 'Needs attention ⚠️'}
          </ThemedText>
        </Card>

        {/* Per-metric rows */}
        {breakdown && (
          <Card>
            <ThemedText variant="h3" style={{ marginBottom: spacing.sm }}>Score Breakdown</ThemedText>
            {Object.entries(breakdown as Record<string, number>).map(([key, val]) => (
              <View key={key} style={styles.metricRow}>
                <Text style={styles.metricLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, {
                    width: `${val}%`,
                    backgroundColor: val >= 80 ? '#10B981' : val >= 50 ? '#F59E0B' : colors.danger,
                  }]} />
                </View>
                <Text style={styles.metricVal}>{val}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Stats */}
        <Card>
          <ThemedText variant="h3" style={{ marginBottom: spacing.sm }}>Trip Stats</ThemedText>
          {[
            ['Distance', `${distanceKm?.toFixed(1) ?? 0} km`],
            ['Duration', formatDuration(durationSec ?? 0)],
            ['Phone Use', `${Math.round(phoneUseSec ?? 0)}s (${phonePickups ?? 0} pickup${phonePickups !== 1 ? 's' : ''})`],
            ['Hard Brakes', String(harshBrakes ?? 0)],
            ['Sharp Corners', String(sharpCorners ?? 0)],
          ].map(([label, value]) => (
            <View key={label} style={styles.statRow}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statValue}>{value}</Text>
            </View>
          ))}
        </Card>

        {/* Coaching Tip */}
        {tip && (
          <Card style={styles.tipCard}>
            <Text style={{ fontSize: 28, marginBottom: 8 }}>💡</Text>
            <ThemedText variant="h3" style={{ marginBottom: 4 }}>Coaching Tip</ThemedText>
            <ThemedText variant="body" color={colors.textMuted}>{tip}</ThemedText>
          </Card>
        )}

        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.sm, gap: spacing.sm, paddingBottom: spacing.xl },
  scoreCard: { alignItems: 'center', paddingVertical: spacing.md },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  metricLabel: { width: 80, fontSize: fontSize.small, color: colors.textMuted, textTransform: 'capitalize' },
  barTrack: { flex: 1, height: 8, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.full },
  metricVal: { width: 28, fontSize: fontSize.small, fontWeight: '700', textAlign: 'right', color: colors.textPrimary },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  statLabel: { fontSize: fontSize.body, color: colors.textMuted },
  statValue: { fontSize: fontSize.body, fontWeight: '600', color: colors.textPrimary },
  tipCard: { alignItems: 'center', textAlign: 'center' },
  homeBtn: {
    height: 52, borderRadius: radius.md, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  homeBtnText: { color: '#fff', fontSize: fontSize.body, fontWeight: '700' },
});
