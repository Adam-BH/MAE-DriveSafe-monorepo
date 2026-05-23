import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useDriver(id: string) {
  return useQuery({
    queryKey: ['driver', id],
    queryFn: async () => {
      const { data } = await api.get(`/drivers/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useDriverSessions(id: string, params?: { from?: string; to?: string; page?: number }) {
  return useQuery({
    queryKey: ['driver-sessions', id, params],
    queryFn: async () => {
      const { data } = await api.get(`/drivers/${id}/sessions`, { params });
      return data;
    },
    enabled: !!id,
  });
}

export function useDriverScores(id: string, period: '30d' | '90d' | '180d' | 'all' = '90d') {
  return useQuery({
    queryKey: ['driver-scores', id, period],
    queryFn: async () => {
      const { data } = await api.get(`/drivers/${id}/scores`, { params: { period } });
      return data;
    },
    enabled: !!id,
  });
}

export function useDriverAnalytics(id: string) {
  return useQuery({
    queryKey: ['driver-analytics', id],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/driver/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useDriverEvents(id: string) {
  return useQuery({
    queryKey: ['driver-events', id],
    queryFn: async () => {
      const { data } = await api.get(`/drivers/${id}/sessions`, { params: { limit: 100 } });
      return data;
    },
    enabled: !!id,
  });
}

export function usePatchDriver(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { insurer_notes?: string; premium_monthly?: number; policy_type?: string }) => {
      const { data } = await api.patch(`/drivers/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['driver', id] }),
  });
}

export function useDrivers(params?: { risk_tier?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['drivers', params],
    queryFn: async () => {
      const { data } = await api.get('/drivers', { params });
      return data;
    },
    staleTime: 30_000,
  });
}
