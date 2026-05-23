import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, FileText, TrendingUp } from 'lucide-react';
import { PageShell } from '../components/layout/PageShell';
import { StatCard, StatCardSkeleton } from '../components/ui/StatCard';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge, riskBadgeVariant, scoreBadgeVariant } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { usePortfolio } from '../hooks/usePortfolio';

export default function Portfolio() {
  const nav = useNavigate();
  const { data, isLoading, error } = usePortfolio();

  return (
    <PageShell title="Portfolio Overview" subtitle="Fleet-wide telematics dashboard">
      {error && (
        <Alert variant="error" className="mb-6">
          Failed to load portfolio data. Please try again.
        </Alert>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Drivers"
              value={data?.total_drivers ?? 0}
              icon={<Users size={20} />}
              sub={`${data?.app_adoption_pct ?? 0}% app adoption`}
            />
            <StatCard
              label="Avg Score"
              value={data?.avg_score ?? 0}
              icon={<TrendingUp size={20} />}
              sub="Portfolio average"
            />
            <StatCard
              label="Active Claims"
              value={data?.active_claims ?? 0}
              icon={<FileText size={20} />}
              sub={`Loss ratio ${((data?.loss_ratio ?? 0) * 100).toFixed(1)}%`}
            />
            <StatCard
              label="High Risk"
              value={data?.high_risk_count ?? 0}
              icon={<AlertTriangle size={20} />}
              sub="Score < 50"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader title="Risk Distribution" />
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {['Low', 'Medium', 'High'].map((t) => (
                <div key={t}>
                  <div className="flex justify-between mb-1">
                    <div className="h-3 bg-gray-200 rounded w-12" />
                    <div className="h-3 bg-gray-200 rounded w-8" />
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(['low', 'medium', 'high'] as const).map((tier) => {
                const total = Object.values(data?.score_distribution ?? {}).reduce((a, b) => a + b, 0);
                const count = data?.score_distribution?.[tier] ?? 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const barColor = tier === 'low' ? 'bg-emerald-500' : tier === 'medium' ? 'bg-amber-400' : 'bg-danger';
                return (
                  <div key={tier}>
                    <div className="flex justify-between mb-1">
                      <span className="text-small font-medium capitalize text-text-primary">{tier}</span>
                      <span className="text-small text-text-muted">{count} drivers ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!isLoading && (
            <div className="mt-4 pt-4 border-t border-[rgba(43,52,151,0.08)] grid grid-cols-2 gap-3">
              <div>
                <p className="text-small text-text-muted">Sessions (30d)</p>
                <p className="font-heading font-semibold text-text-primary">{data?.sessions_30d ?? 0}</p>
              </div>
              <div>
                <p className="text-small text-text-muted">Est. Savings YTD</p>
                <p className="font-heading font-semibold text-secondary-dark">${data?.estimated_savings_ytd?.toLocaleString() ?? 0}</p>
              </div>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2" padding={false}>
          <div className="px-6 py-4 border-b border-[rgba(43,52,151,0.08)]">
            <h3 className="font-heading font-semibold text-h3 text-text-primary">Top Risk Drivers</h3>
            <p className="text-small text-text-muted">Lowest composite scores requiring attention</p>
          </div>
          {isLoading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                  </div>
                  <div className="h-6 w-12 bg-gray-200 rounded-full" />
                </div>
              ))}
            </div>
          ) : data?.top_risk_drivers?.length === 0 ? (
            <p className="p-8 text-center text-text-muted text-body">No high-risk drivers</p>
          ) : (
            <div className="divide-y divide-[rgba(43,52,151,0.06)]">
              {data?.top_risk_drivers?.map((driver) => (
                <div key={driver.id} className="flex items-center gap-3 px-6 py-3 hover:bg-surface transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-heading font-semibold text-sm">
                      {driver.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary text-body truncate">{driver.full_name}</p>
                    <p className="text-small text-text-muted">
                      Phone avg: {driver.phone_avg_sec != null ? `${Math.round(driver.phone_avg_sec)}s` : '—'} · {driver.open_claims} open claim{driver.open_claims !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge variant={scoreBadgeVariant(driver.composite_score)}>
                    {driver.composite_score ?? '—'}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => nav(`/drivers/${driver.id}`)}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
