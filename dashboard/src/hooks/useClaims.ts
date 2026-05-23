import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface ClaimFilters {
  status?: string;
  fraud_flag?: boolean;
  driver_id?: string;
  page?: number;
  limit?: number;
}

export function useClaims(filters?: ClaimFilters) {
  return useQuery({
    queryKey: ['claims', filters],
    queryFn: async () => {
      const { data } = await api.get('/claims', { params: filters });
      return data;
    },
    staleTime: 30_000,
  });
}

export function usePatchClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const { data } = await api.patch(`/claims/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['claims'] }),
  });
}

export function useCreateClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post('/claims', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['claims'] }),
  });
}
