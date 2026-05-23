import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useDriver } from '../../hooks/useDriver';
import { Card } from '../../components/ui/Card';
import { StatRow } from '../../components/ui/StatRow';
import { ThemedText } from '../../components/ui/ThemedText';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

export default function Profile() {
  const router = useRouter();
  const { data, loading } = useDriver();
  const [notifications, setNotifications] = useState(true);

  const driver = data?.driver as any;
  const score = data?.latest_score as any;
  const claimsCount = data?.open_claims_count ?? 0;

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('dg_token');
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {driver?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) ?? 'DG'}
            </Text>
          </View>
          <ThemedText variant="h2">{driver?.full_name ?? '—'}</ThemedText>
          <ThemedText variant="small">{driver?.email ?? '—'}</ThemedText>
        </View>

        {/* Policy Info */}
        <Card>
          <ThemedText variant="h3" style={{ marginBottom: spacing.sm }}>Policy Information</ThemedText>
          <StatRow label="Policy ID" value={driver?.policy_id ?? '—'} />
          <StatRow label="Coverage Type" value={driver?.policy_type ?? '—'} />
          <StatRow label="Vehicle" value={driver ? `${driver.vehicle_year ?? ''} ${driver.vehicle_make ?? ''} ${driver.vehicle_model ?? ''}`.trim() || '—' : '—'} />
          <StatRow label="Monthly Premium" value={driver?.premium_monthly ? `$${driver.premium_monthly}` : '—'} accent />
          <StatRow label="Coverage Start" value={driver?.coverage_start ? new Date(driver.coverage_start).toLocaleDateString() : '—'} />
          <StatRow label="Coverage End" value={driver?.coverage_end ? new Date(driver.coverage_end).toLocaleDateString() : '—'} />
          <StatRow label="Open Claims" value={String(claimsCount)} />
          <StatRow label="Current Score" value={String(score?.composite_score ?? '—')} accent />
        </Card>

        {/* Notifications */}
        <Card>
          <View style={styles.notifRow}>
            <View>
              <ThemedText variant="body" style={{ fontWeight: '600' }}>Push Notifications</ThemedText>
              <ThemedText variant="small">Score updates, coaching tips, rewards</ThemedText>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: colors.secondary, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>
        </Card>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.sm, gap: spacing.sm, paddingBottom: spacing.xl },
  avatarSection: { alignItems: 'center', gap: 4, paddingVertical: spacing.sm },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: { color: '#fff', fontSize: fontSize.h1, fontWeight: '700' },
  notifRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  signOutBtn: {
    height: 48, borderRadius: radius.md, borderWidth: 2, borderColor: colors.danger,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  signOutText: { color: colors.danger, fontSize: fontSize.body, fontWeight: '700' },
});
