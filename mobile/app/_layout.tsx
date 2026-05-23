import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Montserrat_600SemiBold': require('@expo-google-fonts/montserrat/Montserrat_600SemiBold.ttf'),
    'DMSans_400Regular': require('@expo-google-fonts/dm-sans/DMSans_400Regular.ttf'),
    'DMSans_500Medium': require('@expo-google-fonts/dm-sans/DMSans_500Medium.ttf'),
  });

  const [authReady, setAuthReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function checkAuth() {
      const token = await AsyncStorage.getItem('dg_token');
      if (token) {
        const payload = parseJwt(token);
        const expired = payload?.exp && payload.exp * 1000 < Date.now();
        if (expired) await AsyncStorage.removeItem('dg_token');
        else setIsAuthed(true);
      }
      setAuthReady(true);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (!fontsLoaded || !authReady) return;
    SplashScreen.hideAsync();
    const inAuth = segments[0] === '(auth)';
    if (!isAuthed && !inAuth) router.replace('/(auth)/login');
    else if (isAuthed && inAuth) router.replace('/(tabs)');
  }, [fontsLoaded, authReady, isAuthed, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="session/live" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="session/summary" />
    </Stack>
  );
}
