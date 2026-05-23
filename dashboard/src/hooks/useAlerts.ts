import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface AlertFilters {
  driver_id?: string;
  severity?: string;
  resolved?: boolean;
  page?: number;
}

export function useAlerts(filters?: AlertFilters) {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: async () => {
      const { data } = await api.get('/alerts', { params: filters });
      return data;
    },
    staleTime: 30_000,
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/alerts/${id}/resolve`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}
