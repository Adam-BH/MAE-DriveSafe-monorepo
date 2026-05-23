import React, { useState } from 'react';
import { AlertTriangle, Info, CheckCircle, Zap, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Alert as AlertBanner } from '../components/ui/Alert';
import { useAlerts, useResolveAlert } from '../hooks/useAlerts';

const SEVERITY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  critical: { icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/8 border-danger/20' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary/5 border-primary/15' },
  positive: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
};

const ORDER: string[] = ['critical', 'warning', 'info', 'positive'];

export default function Alerts() {
  const nav = useNavigate();
  const [showResolved, setShowResolved] = useState(false);
  const [toast, setToast] = useState('');

  const { data, isLoading, error } = useAlerts({ resolved: showResolved ? undefined : false });
  const resolve = useResolveAlert();

  async function handleResolve(id: string) {
    try {
      await resolve.mutateAsync(id);
    } catch {
      setToast('Failed to resolve alert');
    }
  }

  const alerts = data?.data ?? [];
  const grouped = ORDER.reduce<Record<string, typeof alerts>>(
    (acc, sev) => ({ ...acc, [sev]: alerts.filter((a: any) => a.severity === sev) }),
    {}
  );

  return (
    <PageShell
      title="Alerts"
      subtitle="Driver risk signals and system notifications"
      action={
        <label className="flex items-center gap-2 text-small font-body cursor-pointer text-text-muted">
          <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} className="rounded" />
          Show resolved
        </label>
      }
    >
      {toast && (
        <div className="fixed top-4 right-4 z-50 w-72">
          <AlertBanner variant="error" onDismiss={() => setToast('')}>{toast}</AlertBanner>
        </div>
      )}

      {error && <AlertBanner variant="error" className="mb-4">Failed to load alerts</AlertBanner>}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg border h-20 p-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48" />
                  <div className="h-3 bg-gray-100 rounded w-72" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card className="text-center py-16">
          <CheckCircle size={48} className="mx-auto text-secondary mb-3" />
          <p className="font-heading font-semibold text-text-primary">All clear</p>
          <p className="text-text-muted text-body mt-1">No active alerts</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {ORDER.map((severity) => {
            const group = grouped[severity] ?? [];
            if (group.length === 0) return null;
            const cfg = SEVERITY_CONFIG[severity];
            return (
              <div key={severity}>
                <h2 className="font-heading font-semibold text-small uppercase tracking-wide text-text-muted mb-3 capitalize">
                  {severity} · {group.length}
                </h2>
                <div className="space-y-2">
                  {group.map((alert: any) => {
                    const Icon = cfg.icon;
                    return (
                      <div key={alert.id} className={`flex items-start gap-3 rounded-lg border p-4 ${cfg.bg}`}>
                        <div className={`mt-0.5 flex-shrink-0 ${cfg.color}`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-medium text-body text-text-primary">{alert.title}</p>
                            {alert.resolved && <Badge variant="neutral" className="text-[10px]">Resolved</Badge>}
                          </div>
                          {alert.body && <p className="text-small text-text-muted">{alert.body}</p>}
                          <div className="flex items-center gap-3 mt-1.5">
                            {alert.drivers?.full_name && (
                              <button
                                onClick={() => nav(`/drivers/${alert.driver_id}`)}
                                className="flex items-center gap-1 text-small text-primary hover:underline"
                              >
                                <ExternalLink size={11} /> {alert.drivers.full_name}
                              </button>
                            )}
                            <span className="text-small text-text-muted">
                              {new Date(alert.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {!alert.resolved && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleResolve(alert.id)}
                            loading={resolve.isPending}
                          >
                            <Check size={14} /> Resolve
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
