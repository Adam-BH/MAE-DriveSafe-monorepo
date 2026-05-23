import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'neutral';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary-dark',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-amber-100 text-amber-700',
  success: 'bg-emerald-100 text-emerald-700',
  neutral: 'bg-gray-100 text-gray-600',
};

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-body ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function riskBadgeVariant(tier: string | null): Variant {
  if (tier === 'low') return 'success';
  if (tier === 'medium') return 'warning';
  if (tier === 'high') return 'danger';
  return 'neutral';
}

export function scoreBadgeVariant(score: number | null): Variant {
  if (score === null) return 'neutral';
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}
