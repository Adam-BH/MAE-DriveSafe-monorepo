import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface PageShellProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function PageShell({ title, subtitle, action, children }: PageShellProps) {
  return (
    <div className="flex min-h-screen bg-surface font-body">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} subtitle={subtitle} action={action} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
