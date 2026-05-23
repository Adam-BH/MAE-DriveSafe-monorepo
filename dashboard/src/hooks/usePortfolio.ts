import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface PortfolioData {
  total_drivers: number;
  avg_score: number;
  loss_ratio: number;
  high_risk_count: number;
  active_claims: number;
  sessions_30d: number;
  app_adoption_pct: number;
  estimated_savings_ytd: number;
  score_distribution: { low: number; medium: number; high: number };
  top_risk_drivers: TopRiskDriver[];
}

export interface TopRiskDriver {
  id: string;
  full_name: string;
  composite_score: number | null;
  risk_tier: 'low' | 'medium' | 'high' | null;
  phone_avg_sec: number | null;
  open_claims: number;
}

export function usePortfolio() {
  return useQuery<PortfolioData>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/portfolio');
      return data;
    },
    staleTime: 60_000,
  });
}
