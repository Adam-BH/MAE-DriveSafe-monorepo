import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';

export interface DriverProfile {
  driver: Record<string, unknown>;
  latest_score: Record<string, unknown> | null;
  open_claims_count: number;
  recent_sessions: Record<string, unknown>[];
}

export function useDriver() {
  const [data, setData] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const token = await AsyncStorage.getItem('dg_token');
        if (!token) { setLoading(false); return; }
        const payload = JSON.parse(atob(token.split('.')[1]));
        const driverId = payload.driverId;
        if (!driverId) { setLoading(false); return; }
        const { data: res } = await api.get(`/drivers/${driverId}`);
        setData(res);
      } catch (e: any) {
        setError(e?.response?.data?.error ?? 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { data, loading, error };
}
