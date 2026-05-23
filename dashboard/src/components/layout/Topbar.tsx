import React from 'react';
import { Bell } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Topbar({ title, subtitle, action }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-[rgba(43,52,151,0.08)] flex items-center px-6 gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="font-heading font-semibold text-h2 text-text-primary leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-small text-text-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
      <button className="relative p-2 rounded-md hover:bg-surface text-text-muted hover:text-primary transition-colors">
        <Bell size={20} />
      </button>
    </header>
  );
}
