import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, AlertTriangle, Flag, DollarSign } from 'lucide-react';
import { PageShell } from '../components/layout/PageShell';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge, riskBadgeVariant, scoreBadgeVariant } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { Table } from '../components/ui/Table';
import { ScoreChart } from '../components/charts/ScoreChart';
import { EventBreakdown } from '../components/charts/EventBreakdown';
import { KmTrend } from '../components/charts/KmTrend';
import { useDriver, useDriverSessions, useDriverScores, useDriverAnalytics } from '../hooks/useDriver';
import { useClaims } from '../hooks/useClaims';

type Tab = 'overview' | 'sessions' | 'events' | 'claims' | 'analytics';

export default function DriverDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const { data: driverData, isLoading } = useDriver(id!);
  const { data: sessionsData } = useDriverSessions(id!);
  const { data: scores } = useDriverScores(id!);
  const { data: analytics } = useDriverAnalytics(id!);
  const { data: claimsData } = useClaims({ driver_id: id });

  const driver = driverData?.driver;
  const latestScore = driverData?.latest_score;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'sessions', label: 'Sessions' },
    { key: 'events', label: 'Events' },
    { key: 'claims', label: 'Claims' },
    { key: 'analytics', label: 'Analytics' },
  ];

  return (
    <PageShell
      title={isLoading ? 'Loading…' : driver?.full_name ?? 'Driver'}
      subtitle={driver?.policy_id}
      action={
        <Button variant="ghost" size="sm" onClick={() => nav(-1)}>
          <ArrowLeft size={16} /> Back
        </Button>
      }
    >
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 space-y-4">
          <Card>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="font-heading font-semibold text-primary text-xl">
                    {driver?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-text-primary">{driver?.full_name}</h3>
                <p className="text-small text-text-muted mb-2">{driver?.email}</p>
                <Badge variant={riskBadgeVariant(latestScore?.risk_tier)}>
                  {latestScore?.risk_tier ?? 'unscored'}
                </Badge>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Policy Info" />
            <dl className="space-y-2 text-small">
              {[
                ['Policy ID', driver?.policy_id],
                ['Type', driver?.policy_type],
                ['Vehicle', driver ? `${driver.vehicle_year ?? ''} ${driver.vehicle_make ?? ''} ${driver.vehicle_model ?? ''}`.trim() : '—'],
                ['Premium', driver?.premium_monthly ? `$${driver.premium_monthly}/mo` : '—'],
                ['Enrolled', driver?.enrolled_at ? new Date(driver.enrolled_at).toLocaleDateString() : '—'],
                ['Open Claims', driverData?.open_claims_count ?? 0],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex justify-between gap-2">
                  <dt className="text-text-muted flex-shrink-0">{label}</dt>
                  <dd className="font-medium text-text-primary text-right">{String(value ?? '—')}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                <Phone size={14} /> Send Coaching
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Flag size={14} /> Flag Driver
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <DollarSign size={14} /> Adjust Premium
              </Button>
            </div>
          </Card>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex border-b border-[rgba(43,52,151,0.1)] mb-6">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2.5 text-sm font-body font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Score" value={latestScore?.composite_score ?? '—'} sub={`Risk: ${latestScore?.risk_tier ?? '—'}`} />
                <StatCard label="Phone/Trip" value={latestScore?.phone_avg_sec != null ? `${Math.round(latestScore.phone_avg_sec)}s` : '—'} sub="Avg phone use" />
                <StatCard label="Hard Brakes / 100km" value={latestScore?.harsh_brakes_per_100km?.toFixed(1) ?? '—'} />
                <StatCard label="Speeding" value={latestScore?.speeding_pct != null ? `${latestScore.speeding_pct.toFixed(1)}%` : '—'} sub="Of sessions" />
              </div>
              <Card>
                <CardHeader title="Score Breakdown" />
                <div className="space-y-3">
                  {(['phone', 'braking', 'speeding', 'cornering', 'night'] as const).map((key) => {
                    const scoreKey = `${key}_score` as keyof typeof latestScore;
                    const val = latestScore?.[scoreKey] as number | null;
                    const pct = val ?? 0;
                    const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-danger';
                    return (
                      <div key={key}>
                        <div className="flex justify-between mb-1">
                          <span className="text-small capitalize text-text-primary font-medium">{key}</span>
                          <span className="text-small text-text-muted">{val ?? '—'}/100</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {tab === 'sessions' && (
            <Table
              columns={[
                { key: 'date', header: 'Date', render: (s) => new Date(s.started_at).toLocaleDateString() },
                { key: 'time', header: 'Time', render: (s) => new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                { key: 'duration', header: 'Duration', render: (s) => s.duration_sec ? `${Math.round(s.duration_sec / 60)}min` : '—' },
                { key: 'km', header: 'Distance', render: (s) => s.distance_km ? `${s.distance_km.toFixed(1)} km` : '—' },
                { key: 'score', header: 'Score', render: (s) => <Badge variant={scoreBadgeVariant(s.trip_score)}>{s.trip_score ?? '—'}</Badge> },
                { key: 'route', header: 'Route', render: (s) => <span className="capitalize">{s.route_type ?? '—'}</span> },
              ]}
              data={sessionsData?.data ?? []}
              emptyMessage="No sessions recorded yet"
            />
          )}

          {tab === 'events' && (
            <Card>
              <CardHeader title="Event History" subtitle="All sensor events for this driver" />
              <p className="text-text-muted text-body text-center py-8">
                Events are shown per-session. Select a session to view its events.
              </p>
            </Card>
          )}

          {tab === 'claims' && (
            <Table
              columns={[
                { key: 'type', header: 'Type', render: (c) => <span className="capitalize">{c.claim_type ?? '—'}</span> },
                { key: 'status', header: 'Status', render: (c) => <Badge variant={c.status === 'settled' ? 'success' : c.status === 'denied' ? 'danger' : 'warning'}>{c.status}</Badge> },
                { key: 'date', header: 'Incident Date', render: (c) => c.incident_at ? new Date(c.incident_at).toLocaleDateString() : '—' },
                { key: 'cost', header: 'Est. Cost', render: (c) => c.estimated_cost ? `$${c.estimated_cost.toLocaleString()}` : '—' },
                { key: 'fraud', header: 'Fraud Flag', render: (c) => c.fraud_flag ? <Badge variant="danger">Flagged</Badge> : <span className="text-text-muted">—</span> },
              ]}
              data={claimsData?.data ?? []}
              emptyMessage="No claims for this driver"
            />
          )}

          {tab === 'analytics' && (
            <div className="space-y-6">
              <Card>
                <CardHeader title="Score Trend" subtitle="Composite score over time" />
                <ScoreChart data={scores ?? []} />
              </Card>
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader title="Monthly Distance" />
                  <KmTrend data={analytics?.monthly_km ?? []} />
                </Card>
                <Card>
                  <CardHeader title="Event Breakdown" />
                  <EventBreakdown data={analytics?.event_breakdown ?? {}} />
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
