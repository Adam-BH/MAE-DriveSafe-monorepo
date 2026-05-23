import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatCard({ label, value, sub, icon, trend, className = '' }: StatCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-small font-body font-medium text-text-muted uppercase tracking-wide">{label}</p>
          <p className="mt-1 text-h1 font-heading font-semibold text-text-primary leading-none">{value}</p>
          {sub && <p className="mt-1 text-small text-text-muted">{sub}</p>}
          {trend && (
            <p className={`mt-1 text-small font-medium ${trend.value >= 0 ? 'text-emerald-600' : 'text-danger'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)} {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-3 p-2.5 bg-primary/8 rounded-md text-primary flex-shrink-0">{icon}</div>
        )}
      </div>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card>
      <div className="animate-pulse space-y-2">
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-8 bg-gray-200 rounded w-16" />
        <div className="h-3 bg-gray-200 rounded w-20" />
      </div>
    </Card>
  );
}
