import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistory } from '../../hooks/useHistory';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ThemedText } from '../../components/ui/ThemedText';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

function scoreBadgeVariant(score: number | null) {
  if (score == null) return 'neutral' as const;
  if (score >= 80) return 'success' as const;
  if (score >= 50) return 'warning' as const;
  return 'danger' as const;
}

export default function History() {
  const { data, loading } = useHistory();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="h2">Trip History</ThemedText>
        <ThemedText variant="small">{data.length} trips recorded</ThemedText>
      </View>

      {data.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>🛣️</Text>
          <ThemedText variant="h3" style={{ marginTop: spacing.sm }}>No trips yet</ThemedText>
          <ThemedText variant="small" style={{ marginTop: 4 }}>Start a driving session to see your history</ThemedText>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.sm, gap: 8, paddingBottom: spacing.xl }}
          renderItem={({ item: s }) => (
            <TouchableOpacity onPress={() => setExpanded(expanded === s.id ? null : s.id)}>
              <Card style={styles.tripCard}>
                <View style={styles.tripHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="body" style={{ fontWeight: '600' }}>
                      {new Date(s.started_at).toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </ThemedText>
                    <ThemedText variant="small">
                      {new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {s.duration_sec ? ` · ${formatDuration(s.duration_sec)}` : ''}
                      {s.distance_km ? ` · ${s.distance_km.toFixed(1)} km` : ''}
                    </ThemedText>
                  </View>
                  <Badge variant={scoreBadgeVariant(s.trip_score)} label={String(s.trip_score ?? '—')} />
                </View>

                {expanded === s.id && s.score_breakdown && (
                  <View style={styles.breakdown}>
                    {Object.entries(s.score_breakdown as Record<string, number>).map(([key, val]) => (
                      <View key={key} style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>{key}</Text>
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, {
                            width: `${val}%`,
                            backgroundColor: val >= 80 ? '#10B981' : val >= 50 ? '#F59E0B' : colors.danger,
                          }]} />
                        </View>
                        <Text style={styles.breakdownVal}>{val}</Text>
                      </View>
                    ))}
                    {s.route_type && <Text style={styles.meta}>Route: {s.route_type}</Text>}
                    {s.weather && <Text style={styles.meta}>Weather: {s.weather}</Text>}
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: spacing.sm, paddingBottom: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  tripCard: { gap: 8 },
  tripHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  breakdown: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, gap: 8 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  breakdownLabel: { width: 72, fontSize: fontSize.small, color: colors.textMuted, textTransform: 'capitalize' },
  barTrack: { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.full },
  breakdownVal: { width: 28, fontSize: fontSize.small, fontWeight: '600', color: colors.textPrimary, textAlign: 'right' },
  meta: { fontSize: fontSize.small, color: colors.textMuted, textTransform: 'capitalize' },
});
