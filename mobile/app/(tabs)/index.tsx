import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDriver } from '../../hooks/useDriver';
import { ScoreRing } from '../../components/session/ScoreRing';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ThemedText } from '../../components/ui/ThemedText';
import { colors, fontSize, spacing, radius, shadow, scoreColor, discountTier } from '../../lib/theme';

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { data, loading, error } = useDriver();

  const driver = data?.driver as any;
  const score = data?.latest_score as any;
  const recentSessions = (data?.recent_sessions as any[]) ?? [];
  const compositeScore = score?.composite_score ?? 0;
  const tier = discountTier(compositeScore);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {driver?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) ?? 'DG'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText variant="h3">{driver?.full_name ?? 'Driver'}</ThemedText>
            <ThemedText variant="small">{driver?.policy_id ?? ''}</ThemedText>
          </View>
          <Badge variant={tier.pct > 0 ? 'success' : 'neutral'} label={tier.label} />
        </View>

        {/* Score Ring */}
        <Card style={styles.scoreCard}>
          <View style={styles.scoreRingContainer}>
            <ScoreRing score={compositeScore} size={180} />
          </View>
          <View style={styles.scoreMeta}>
            <Badge
              variant={compositeScore >= 80 ? 'success' : compositeScore >= 50 ? 'warning' : 'danger'}
              label={score?.risk_tier ? `${score.risk_tier.toUpperCase()} RISK` : 'UNSCORED'}
            />
            <ThemedText variant="small" style={{ marginTop: 4 }}>
              {tier.pct > 0 ? `${tier.pct}% discount applied` : 'Earn a discount by improving your score'}
            </ThemedText>
          </View>
        </Card>

        {/* Stat Cards */}
        <View style={styles.stats}>
          {[
            { label: 'Trips', value: String(score?.trips_counted ?? 0) },
            { label: 'Distance', value: score?.km_counted ? `${Math.round(score.km_counted)} km` : '—' },
            { label: 'Phone avg', value: score?.phone_avg_sec ? `${Math.round(score.phone_avg_sec)}s` : '—' },
            { label: 'Discount', value: tier.pct > 0 ? `${tier.pct}%` : 'None' },
          ].map((s) => (
            <Card key={s.label} style={styles.statCard}>
              <ThemedText variant="label">{s.label}</ThemedText>
              <ThemedText variant="h2" style={{ marginTop: 4 }}>{s.value}</ThemedText>
            </Card>
          ))}
        </View>

        {/* Recent Trips */}
        {recentSessions.length > 0 && (
          <View style={styles.section}>
            <ThemedText variant="h3" style={{ marginBottom: spacing.xs }}>Recent Trips</ThemedText>
            {recentSessions.map((s: any) => (
              <Card key={s.id} style={styles.tripRow}>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: '600' }}>
                    {new Date(s.started_at).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </ThemedText>
                  <ThemedText variant="small">
                    {s.distance_km?.toFixed(1) ?? '—'} km · {s.duration_sec ? formatDuration(s.duration_sec) : '—'}
                  </ThemedText>
                </View>
                <Badge
                  variant={s.trip_score >= 80 ? 'success' : s.trip_score >= 50 ? 'warning' : 'danger'}
                  label={String(s.trip_score ?? '—')}
                />
              </Card>
            ))}
          </View>
        )}

        {/* CTA Button */}
        <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/session/live')}>
          <Text style={styles.startBtnText}>🚗  Start Driving Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.sm, gap: spacing.sm, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: fontSize.body },
  scoreCard: { alignItems: 'center', paddingVertical: spacing.md },
  scoreRingContainer: { marginBottom: spacing.sm },
  scoreMeta: { alignItems: 'center', gap: 4 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { flex: 1, minWidth: '45%', padding: spacing.sm },
  section: { gap: 8 },
  tripRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  startBtn: {
    height: 56, borderRadius: radius.md, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    ...shadow.md,
  },
  startBtnText: { color: '#fff', fontSize: fontSize.h3, fontWeight: '700' },
});
