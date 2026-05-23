import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';

export function useHistory(page = 1) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('dg_token');
      if (!token) return;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const driverId = payload.driverId;
      if (!driverId) return;
      const { data: res } = await api.get(`/drivers/${driverId}/sessions`, {
        params: { page, limit: 20 },
      });
      setData(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return { data, total, loading, error, refresh: load };
}
