import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  Receipt,
  BarChart3,
  Sliders,
  ShieldCheck,
  Headphones,
  Users,
  Search,
  DollarSign
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeRole } = useAuthStore();

  const navItemsByRole: Record<string, { label: string; path: string; icon: React.ReactNode }[]> = {
    FACILITY: [
      { label: 'Facility Dashboard', path: '/facility/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Ward Management', path: '/facility/wards', icon: <Layers className="w-4 h-4" /> },
      { label: 'Shift Roster & Post', path: '/facility/shifts', icon: <Calendar className="w-4 h-4" /> },
      { label: 'AI Explainable Match', path: '/facility/matching', icon: <Sparkles className="w-4 h-4" /> },
      { label: 'Timesheet Approvals', path: '/facility/timesheets', icon: <Clock className="w-4 h-4" /> },
      { label: 'Facility Invoices', path: '/facility/invoices', icon: <Receipt className="w-4 h-4" /> },
      { label: 'Budget Projections', path: '/facility/budgets', icon: <DollarSign className="w-4 h-4" /> },
    ],
    PROFESSIONAL: [
      { label: 'Professional Mobile Home', path: '/professional/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Discover & Search Shifts', path: '/professional/shifts', icon: <Search className="w-4 h-4" /> },
      { label: 'My Shift Bookings', path: '/professional/bookings', icon: <Calendar className="w-4 h-4" /> },
      { label: 'My Credentials Vault', path: '/professional/credentials', icon: <CheckCircle2 className="w-4 h-4" /> },
      { label: 'My Earnings & SEPA Pay', path: '/professional/earnings', icon: <DollarSign className="w-4 h-4" /> },
    ],
    ADMIN: [
      { label: 'Operations Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
      { label: 'Demand AI Forecast', path: '/admin/forecast', icon: <Sparkles className="w-4 h-4" /> },
      { label: 'What-If Simulator', path: '/admin/what-if', icon: <Sliders className="w-4 h-4" /> },
      { label: 'Immutable Audit Trail', path: '/admin/audit', icon: <ShieldCheck className="w-4 h-4" /> },
      { label: 'Integrations Monitor', path: '/admin/integrations', icon: <Users className="w-4 h-4" /> },
    ],
    COMPLIANCE: [
      { label: 'Compliance Overview', path: '/compliance/dashboard', icon: <ShieldCheck className="w-4 h-4" /> },
      { label: 'Credential Review', path: '/compliance/credentials', icon: <CheckCircle2 className="w-4 h-4" /> },
      { label: 'Eligibility Audits', path: '/compliance/verifications', icon: <BarChart3 className="w-4 h-4" /> },
    ],
    PAYROLL: [
      { label: 'Timesheet Locking', path: '/payroll/timesheets', icon: <Clock className="w-4 h-4" /> },
      { label: 'Payment Ledger', path: '/payroll/payments', icon: <DollarSign className="w-4 h-4" /> },
      { label: 'Billing Reconciliation', path: '/payroll/reconciliation', icon: <Receipt className="w-4 h-4" /> },
    ],
    SUPPORT: [
      { label: 'Support Case Inbox', path: '/support/cases', icon: <Headphones className="w-4 h-4" /> },
      { label: 'Knowledge Base', path: '/support/kb', icon: <Search className="w-4 h-4" /> },
    ]
  };

  const navItems = navItemsByRole[activeRole] || navItemsByRole['FACILITY'];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-slate-800/80">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Navigation</div>
        <div className="text-xs font-semibold text-cyan-400 flex items-center">
          <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2"></span>
          {activeRole} PORTAL
        </div>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Integration Sandbox Alert */}
      <div className="p-4 m-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
        <div className="font-semibold text-slate-200 mb-1 flex items-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> Demo Sandbox Mode
        </div>
        NMBI, Garda, Maps, OCR, and SEPA integrations running in simulated sandbox mode.
      </div>
    </aside>
  );
};
