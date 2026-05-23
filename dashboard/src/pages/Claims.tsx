import React, { useState } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Modal } from '../components/ui/Modal';
import { useClaims, usePatchClaim } from '../hooks/useClaims';

const STATUS_VARIANTS: Record<string, 'success' | 'danger' | 'warning' | 'neutral'> = {
  settled: 'success',
  denied: 'danger',
  approved: 'success',
  open: 'warning',
  under_review: 'warning',
  litigated: 'danger',
};

export default function Claims() {
  const [filters, setFilters] = useState<{
    status?: string;
    fraud_flag?: boolean;
    page: number;
  }>({ page: 1 });

  const [selected, setSelected] = useState<any>(null);
  const [toast, setToast] = useState('');

  const { data, isLoading, error } = useClaims(filters);
  const patchClaim = usePatchClaim();

  async function handleStatusChange(id: string, status: string) {
    try {
      await patchClaim.mutateAsync({ id, payload: { status } });
      setSelected(null);
    } catch {
      setToast('Failed to update claim status');
    }
  }

  return (
    <PageShell title="Claims" subtitle="All driver claims and incidents">
      {toast && (
        <div className="fixed top-4 right-4 z-50 w-72">
          <Alert variant="error" onDismiss={() => setToast('')}>{toast}</Alert>
        </div>
      )}

      {error && <Alert variant="error" className="mb-4">Failed to load claims</Alert>}

      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={filters.status ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined, page: 1 }))}
          className="h-9 px-3 rounded-md border border-[rgba(43,52,151,0.2)] bg-white text-body font-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All statuses</option>
          {['open', 'under_review', 'approved', 'denied', 'settled', 'litigated'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>

        <select
          value={filters.fraud_flag === undefined ? '' : String(filters.fraud_flag)}
          onChange={(e) => setFilters((f) => ({ ...f, fraud_flag: e.target.value === '' ? undefined : e.target.value === 'true', page: 1 }))}
          className="h-9 px-3 rounded-md border border-[rgba(43,52,151,0.2)] bg-white text-body font-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All claims</option>
          <option value="true">Fraud flagged</option>
          <option value="false">No fraud flag</option>
        </select>

        <div className="ml-auto text-small text-text-muted self-center">
          {data?.total != null ? `${data.total} claim${data.total !== 1 ? 's' : ''}` : ''}
        </div>
      </div>

      <Table
        loading={isLoading}
        data={data?.data ?? []}
        emptyMessage="No claims match your filters"
        onRowClick={setSelected}
        columns={[
          { key: 'driver', header: 'Driver', render: (c) => <span className="font-medium">{c.drivers?.full_name ?? '—'}</span> },
          { key: 'type', header: 'Type', render: (c) => <span className="capitalize">{c.claim_type?.replace('_', ' ') ?? '—'}</span> },
          { key: 'status', header: 'Status', render: (c) => <Badge variant={STATUS_VARIANTS[c.status] ?? 'neutral'}>{c.status.replace('_', ' ')}</Badge> },
          { key: 'incident_at', header: 'Incident Date', render: (c) => c.incident_at ? new Date(c.incident_at).toLocaleDateString() : '—' },
          { key: 'estimated_cost', header: 'Est. Cost', render: (c) => c.estimated_cost ? `$${c.estimated_cost.toLocaleString()}` : '—' },
          { key: 'fraud', header: 'Fraud', render: (c) => c.fraud_flag ? <Badge variant="danger">Flagged</Badge> : <span className="text-text-muted">—</span> },
          {
            key: 'action',
            header: '',
            render: (c) => (
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelected(c); }}>
                Review
              </Button>
            ),
          },
        ]}
      />

      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title="Claim Review" size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted text-small mb-0.5">Driver</p>
                <p className="font-medium">{selected.drivers?.full_name ?? '—'}</p>
              </div>
              <div>
                <p className="text-text-muted text-small mb-0.5">Claim Type</p>
                <p className="font-medium capitalize">{selected.claim_type?.replace('_', ' ') ?? '—'}</p>
              </div>
              <div>
                <p className="text-text-muted text-small mb-0.5">Phone at Impact</p>
                <p className="font-medium">{selected.phone_at_impact === true ? 'Yes' : selected.phone_at_impact === false ? 'No' : 'Unknown'}</p>
              </div>
              <div>
                <p className="text-text-muted text-small mb-0.5">GPS Match</p>
                <p className="font-medium">{selected.telematics_match === true ? 'Yes' : selected.telematics_match === false ? 'No' : 'Unknown'}</p>
              </div>
            </div>
            {selected.description && (
              <div>
                <p className="text-text-muted text-small mb-1">Description</p>
                <p className="text-body bg-surface rounded p-3">{selected.description}</p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              {['approved', 'denied', 'under_review', 'settled'].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={s === 'denied' ? 'danger' : s === 'approved' || s === 'settled' ? 'secondary' : 'outline'}
                  onClick={() => handleStatusChange(selected.id, s)}
                  loading={patchClaim.isPending}
                >
                  {s.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </PageShell>
  );
}
