import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDriver } from '../../hooks/useDriver';
import { Card } from '../../components/ui/Card';
import { ThemedText } from '../../components/ui/ThemedText';
import { colors, fontSize, spacing, radius, discountTier } from '../../lib/theme';

const TIERS = [
  { label: 'None', minScore: 0, maxScore: 49, pct: 0, color: '#9CA3AF' },
  { label: 'Bronze', minScore: 50, maxScore: 69, pct: 3, color: '#CD7F32' },
  { label: 'Silver', minScore: 70, maxScore: 79, pct: 8, color: '#9CA3AF' },
  { label: 'Gold', minScore: 80, maxScore: 100, pct: 15, color: '#F59E0B' },
];

const SCORE_BREAKDOWN_LABELS: Record<string, string> = {
  phone: 'Phone use (25%)',
  braking: 'Smooth braking (20%)',
  speeding: 'Speed compliance (20%)',
  cornering: 'Cornering (15%)',
  night: 'Night driving (10%)',
};

export default function Rewards() {
  const { data } = useDriver();
  const score = data?.latest_score as any;
  const compositeScore = score?.composite_score ?? 0;
  const tier = discountTier(compositeScore);
  const [expanded, setExpanded] = useState(false);

  const currentTierIndex = TIERS.findIndex((t) => compositeScore <= t.maxScore);
  const nextTier = TIERS[currentTierIndex + 1];
  const progressToNext = nextTier
    ? ((compositeScore - TIERS[currentTierIndex].minScore) /
       (nextTier.minScore - TIERS[currentTierIndex].minScore)) * 100
    : 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText variant="h2" style={{ marginBottom: spacing.sm }}>Rewards</ThemedText>

        {/* Current Discount */}
        <Card style={styles.discountCard}>
          <Text style={styles.discountEmoji}>{tier.pct > 0 ? '🏅' : '🎯'}</Text>
          <ThemedText variant="h1" color={colors.primary} style={{ textAlign: 'center' }}>
            {tier.pct > 0 ? `${tier.pct}% Discount` : 'No Discount Yet'}
          </ThemedText>
          <ThemedText variant="body" style={{ textAlign: 'center', color: colors.textMuted }}>
            {tier.label} tier · Score: {compositeScore}/100
          </ThemedText>
          {nextTier && (
            <>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(100, progressToNext)}%` }]} />
              </View>
              <ThemedText variant="small" style={{ textAlign: 'center' }}>
                {nextTier.minScore - compositeScore} pts to {nextTier.label} ({nextTier.pct}% discount)
              </ThemedText>
            </>
          )}
        </Card>

        {/* Tier Breakdown */}
        <Card style={{ gap: 12 }}>
          <ThemedText variant="h3">Discount Tiers</ThemedText>
          {TIERS.map((t) => (
            <View key={t.label} style={styles.tierRow}>
              <View style={[styles.tierDot, { backgroundColor: t.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.tierLabel}>{t.label}</Text>
                <Text style={styles.tierRange}>Score {t.minScore}–{t.maxScore}</Text>
              </View>
              <Text style={[styles.tierPct, { color: t.pct > 0 ? colors.primary : colors.textMuted }]}>
                {t.pct > 0 ? `${t.pct}% off` : 'No discount'}
              </Text>
            </View>
          ))}
        </Card>

        {/* Streak */}
        <Card style={styles.streakCard}>
          <Text style={{ fontSize: 36 }}>🔥</Text>
          <ThemedText variant="h3">Driving Streak</ThemedText>
          <ThemedText variant="small">Record {score?.trips_counted ?? 0} trips to build your streak</ThemedText>
        </Card>

        {/* How score is calculated */}
        <Card>
          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <ThemedText variant="h3">How is your score calculated?</ThemedText>
            <Text style={{ fontSize: 18 }}>{expanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {expanded && (
            <View style={{ marginTop: spacing.sm, gap: 8 }}>
              {Object.entries(SCORE_BREAKDOWN_LABELS).map(([key, label]) => (
                <View key={key} style={styles.calcRow}>
                  <Text style={styles.calcLabel}>{label}</Text>
                  {score?.[`${key}_score`] != null && (
                    <Text style={[styles.calcVal, {
                      color: score[`${key}_score`] >= 80 ? '#10B981' : score[`${key}_score`] >= 50 ? '#F59E0B' : colors.danger,
                    }]}>
                      {score[`${key}_score`]}/100
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.sm, gap: spacing.sm, paddingBottom: spacing.xl },
  discountCard: { alignItems: 'center', gap: 8, paddingVertical: spacing.md },
  discountEmoji: { fontSize: 48 },
  progressTrack: { width: '100%', height: 8, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden', marginVertical: 4 },
  progressFill: { height: '100%', backgroundColor: colors.secondary, borderRadius: radius.full },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tierDot: { width: 12, height: 12, borderRadius: 6 },
  tierLabel: { fontSize: fontSize.body, fontWeight: '600', color: colors.textPrimary },
  tierRange: { fontSize: fontSize.small, color: colors.textMuted },
  tierPct: { fontSize: fontSize.body, fontWeight: '600' },
  streakCard: { alignItems: 'center', gap: 6 },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calcLabel: { fontSize: fontSize.body, color: colors.textPrimary, flex: 1 },
  calcVal: { fontSize: fontSize.body, fontWeight: '600' },
});
