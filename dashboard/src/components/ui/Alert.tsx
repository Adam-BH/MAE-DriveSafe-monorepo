import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

type AlertVariant = 'error' | 'warning' | 'success' | 'info';

const config: Record<AlertVariant, { icon: React.ElementType; classes: string }> = {
  error: { icon: XCircle, classes: 'bg-danger/10 border-danger/30 text-danger' },
  warning: { icon: AlertTriangle, classes: 'bg-amber-50 border-amber-300 text-amber-700' },
  success: { icon: CheckCircle, classes: 'bg-emerald-50 border-emerald-300 text-emerald-700' },
  info: { icon: Info, classes: 'bg-primary/8 border-primary/20 text-primary' },
};

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
}

export function Alert({ variant = 'info', title, children, onDismiss }: AlertProps) {
  const { icon: Icon, classes } = config[variant];
  return (
    <div className={`flex gap-3 rounded-md border px-4 py-3 ${classes}`}>
      <Icon size={18} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm font-body">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="flex-shrink-0 opacity-70 hover:opacity-100">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export function Toast({ message, variant = 'error', onDismiss }: { message: string; variant?: AlertVariant; onDismiss: () => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] w-80 shadow-lg">
      <Alert variant={variant} onDismiss={onDismiss}>{message}</Alert>
    </div>
  );
}
