import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useSession } from '../../hooks/useSession';
import { AlertBanner } from '../../components/session/AlertBanner';
import { LiveMetricCard } from '../../components/session/LiveMetricCard';
import { colors, fontSize, spacing, radius, shadow, scoreColor } from '../../lib/theme';

function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function LiveSession() {
  const router = useRouter();
  const { status, metrics, finalSummary, errorMsg, startSession, endSession } = useSession();

  const pulseOpacity = useSharedValue(1);
  const scoreScale = useSharedValue(1);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(withTiming(0.3, { duration: 600 }), withTiming(1, { duration: 600 })),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    scoreScale.value = withSpring(1.08, { damping: 4 }, () => {
      scoreScale.value = withSpring(1);
    });
  }, [metrics.score]);

  useEffect(() => {
    if (status === 'idle') startSession();
  }, []);

  useEffect(() => {
    if (status === 'done' && finalSummary) {
      router.replace({ pathname: '/session/summary', params: { data: JSON.stringify(finalSummary) } });
    }
  }, [status, finalSummary]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseOpacity.value }));
  const scoreStyle = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  const color = scoreColor(metrics.score);

  if (status === 'starting') {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#fff" size="large" />
        <Text style={styles.statusText}>Starting session…</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.statusText}>⚠️ {errorMsg}</Text>
        <TouchableOpacity style={styles.endBtn} onPress={() => router.back()}>
          <Text style={styles.endBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Recording Badge */}
          <View style={styles.recordingRow}>
            <Animated.View style={[styles.recordingDot, pulseStyle]} />
            <Text style={styles.recordingText}>RECORDING</Text>
            <Text style={styles.timer}>{formatTime(metrics.durationSec)}</Text>
          </View>

          {/* Live Score */}
          <Animated.View style={[styles.scoreContainer, scoreStyle]}>
            <Text style={[styles.scoreNumber, { color }]}>{metrics.score}</Text>
            <Text style={styles.scoreLabel}>Live Score</Text>
            <View style={[styles.scorePill, { backgroundColor: color + '22', borderColor: color + '44' }]}>
              <Text style={[styles.scorePillText, { color }]}>
                {metrics.score >= 80 ? 'Excellent' : metrics.score >= 65 ? 'Good' : metrics.score >= 50 ? 'Fair' : 'Poor'}
              </Text>
            </View>
          </Animated.View>

          {/* Phone Alert */}
          <AlertBanner visible={metrics.phoneWarning} />

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <LiveMetricCard
              label="Speed"
              value={`${metrics.speedKmh}`}
              sub="km/h"
              accent={metrics.speedKmh > 120 ? colors.danger : undefined}
            />
            <LiveMetricCard label="Distance" value={`${metrics.distanceKm.toFixed(1)}`} sub="km" />
            <LiveMetricCard
              label="Phone Use"
              value={`${Math.round(metrics.phoneUseSec)}s`}
              sub={`${metrics.phonePickups} pickup${metrics.phonePickups !== 1 ? 's' : ''}`}
              accent={metrics.phonePickups > 0 ? colors.danger : undefined}
            />
            <LiveMetricCard
              label="Hard Brakes"
              value={`${metrics.harshBrakes}`}
              accent={metrics.harshBrakes > 3 ? colors.danger : undefined}
            />
            <LiveMetricCard label="Corners" value={`${metrics.sharpCorners}`} />
            <LiveMetricCard label="Duration" value={formatTime(metrics.durationSec)} />
          </View>

          {/* Tips */}
          {metrics.phoneWarning && (
            <View style={styles.tip}>
              <Text style={styles.tipText}>📵 Phone detected at speed — put it face down</Text>
            </View>
          )}
          {metrics.harshBrakes > 2 && (
            <View style={styles.tip}>
              <Text style={styles.tipText}>🛑 Many hard brakes — try anticipating stops earlier</Text>
            </View>
          )}

          {/* End Button */}
          <TouchableOpacity
            style={[styles.endBtn, status === 'ending' && { opacity: 0.6 }]}
            onPress={endSession}
            disabled={status === 'ending'}
          >
            {status === 'ending' ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.endBtnText}>End Session</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  scroll: { padding: spacing.sm, gap: spacing.sm, paddingBottom: spacing.xl },

  recordingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.danger },
  recordingText: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.small, fontWeight: '700', letterSpacing: 2 },
  timer: { color: '#fff', fontSize: fontSize.body, fontWeight: '600', fontVariant: ['tabular-nums'] },

  scoreContainer: { alignItems: 'center', paddingVertical: spacing.sm },
  scoreNumber: { fontSize: 80, fontWeight: '800', lineHeight: 88 },
  scoreLabel: { color: 'rgba(255,255,255,0.6)', fontSize: fontSize.small, marginBottom: 8 },
  scorePill: {
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.full, borderWidth: 1,
  },
  scorePillText: { fontSize: fontSize.small, fontWeight: '700' },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },

  tip: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.sm,
    padding: spacing.sm, borderLeftWidth: 3, borderLeftColor: colors.danger,
  },
  tipText: { color: '#fff', fontSize: fontSize.small, fontWeight: '500' },

  statusText: { color: '#fff', fontSize: fontSize.body, marginTop: spacing.sm },

  endBtn: {
    height: 52, borderRadius: radius.md, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    ...shadow.md,
  },
  endBtnText: { color: colors.primary, fontSize: fontSize.body, fontWeight: '700' },
});
