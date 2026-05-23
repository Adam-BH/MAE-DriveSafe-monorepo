import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (!data.driver) {
        Alert.alert('Access Denied', 'This app is for drivers only. Use the web portal.');
        return;
      }
      await AsyncStorage.setItem('dg_token', data.token);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Login Failed', e?.response?.data?.error ?? 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>DG</Text>
        </View>
        <Text style={styles.title}>DriveGuard</Text>
        <Text style={styles.sub}>Your safe driving companion</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Sign in</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  logo: {
    width: 72, height: 72, borderRadius: radius.xl,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logoText: { color: '#fff', fontSize: fontSize.h1, fontWeight: '700' },
  title: { fontSize: fontSize.h1, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  sub: { fontSize: fontSize.body, color: colors.textMuted, marginBottom: spacing.lg },
  form: { width: '100%', gap: spacing.sm },
  input: {
    height: 48, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.white, paddingHorizontal: spacing.sm,
    fontSize: fontSize.body, color: colors.textPrimary,
  },
  btn: {
    height: 52, borderRadius: radius.md, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  btnText: { color: '#fff', fontSize: fontSize.body, fontWeight: '700' },
});
