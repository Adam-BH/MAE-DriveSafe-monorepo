import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Bell, LogOut } from 'lucide-react';
import { logout } from '../../lib/auth';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Portfolio' },
  { to: '/claims', icon: FileText, label: 'Claims' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
];

export function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-primary flex flex-col">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-secondary rounded-md flex items-center justify-center">
            <span className="text-white font-heading font-semibold text-sm">DG</span>
          </div>
          <div>
            <p className="font-heading font-semibold text-white text-sm leading-tight">DriveGuard</p>
            <p className="text-white/50 text-[10px]">Insurer Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-body font-medium transition-colors ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-body font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
