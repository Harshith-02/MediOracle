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
  DollarSign,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ChevronRight,
  Activity
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  section?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { activeRole, user, logout } = useAuthStore();

  const navItemsByRole: Record<string, { section: string; items: NavItem[] }[]> = {
    FACILITY: [
      {
        section: 'Core Management',
        items: [
          { label: 'Facility Dashboard', path: '/facility/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Ward Management', path: '/facility/wards', icon: <Layers className="w-4 h-4" /> },
          { label: 'Shift Roster & Post', path: '/facility/shifts', icon: <Calendar className="w-4 h-4" />, badge: '12 Open' },
        ]
      },
      {
        section: 'Workforce & AI',
        items: [
          { label: 'AI Explainable Match', path: '/facility/matching', icon: <Sparkles className="w-4 h-4 text-cyan-400" />, badge: 'AI' },
          { label: 'Timesheet Approvals', path: '/facility/timesheets', icon: <Clock className="w-4 h-4" /> },
        ]
      },
      {
        section: 'Financials',
        items: [
          { label: 'Facility Invoices', path: '/facility/invoices', icon: <Receipt className="w-4 h-4" /> },
          { label: 'Budget Projections', path: '/facility/budgets', icon: <DollarSign className="w-4 h-4" /> },
        ]
      }
    ],
    PROFESSIONAL: [
      {
        section: 'Shift Discovery',
        items: [
          { label: 'Professional Home', path: '/professional/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Discover & Search Shifts', path: '/professional/shifts', icon: <Search className="w-4 h-4" />, badge: 'New' },
          { label: 'My Shift Bookings', path: '/professional/bookings', icon: <Calendar className="w-4 h-4" /> },
        ]
      },
      {
        section: 'Compliance & Pay',
        items: [
          { label: 'Credentials Vault', path: '/professional/credentials', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
          { label: 'Earnings & SEPA Pay', path: '/professional/earnings', icon: <DollarSign className="w-4 h-4" /> },
        ]
      }
    ],
    ADMIN: [
      {
        section: 'Platform Analytics',
        items: [
          { label: 'Operations Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
          { label: 'Demand AI Forecast', path: '/admin/forecast', icon: <Sparkles className="w-4 h-4 text-cyan-400" />, badge: '48h AI' },
          { label: 'What-If Simulator', path: '/admin/what-if', icon: <Sliders className="w-4 h-4" /> },
        ]
      },
      {
        section: 'System Governance',
        items: [
          { label: 'Immutable Audit Trail', path: '/admin/audit', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
          { label: 'Integrations Monitor', path: '/admin/integrations', icon: <Users className="w-4 h-4" /> },
        ]
      }
    ],
    COMPLIANCE: [
      {
        section: 'Credential Verification',
        items: [
          { label: 'Compliance Overview', path: '/compliance/dashboard', icon: <ShieldCheck className="w-4 h-4" /> },
          { label: 'Credential Review', path: '/compliance/credentials', icon: <CheckCircle2 className="w-4 h-4" /> },
          { label: 'Eligibility Audits', path: '/compliance/verifications', icon: <BarChart3 className="w-4 h-4" /> },
        ]
      }
    ],
    PAYROLL: [
      {
        section: 'Payments & Reconciliation',
        items: [
          { label: 'Timesheet Locking', path: '/payroll/timesheets', icon: <Clock className="w-4 h-4" /> },
          { label: 'Payment Ledger', path: '/payroll/payments', icon: <DollarSign className="w-4 h-4" /> },
          { label: 'Billing Reconciliation', path: '/payroll/reconciliation', icon: <Receipt className="w-4 h-4" /> },
        ]
      }
    ],
    SUPPORT: [
      {
        section: 'Helpdesk & Support',
        items: [
          { label: 'Support Case Inbox', path: '/support/cases', icon: <Headphones className="w-4 h-4" /> },
          { label: 'Knowledge Base', path: '/support/kb', icon: <Search className="w-4 h-4" /> },
        ]
      }
    ]
  };

  const sections = navItemsByRole[activeRole] || navItemsByRole['FACILITY'];

  return (
    <aside
      className={`relative h-screen bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out z-30 shadow-2xl ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* 1. BRAND & SIDEBAR HEADER */}
      <div className="h-16 border-b border-slate-800/80 px-4 flex items-center justify-between flex-shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/25 flex-shrink-0">
              M
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base text-slate-100 tracking-tight">MediOracle</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate">Healthcare Workforce Portal</span>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/25">
              M
            </div>
          </div>
        )}

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition ${
            isCollapsed ? 'absolute -right-3 top-5 bg-slate-800 border border-slate-700 shadow-md rounded-full p-1' : ''
          }`}
          title={isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. ACTIVE PORTAL SCOPE CHIP */}
      <div className="px-3 pt-3 pb-1 flex-shrink-0">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <div className="text-[11px] font-bold text-slate-200 tracking-wide">
                {activeRole} PORTAL
              </div>
            </div>
            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" title={`${activeRole} Portal Active`} />
          </div>
        )}
      </div>

      {/* 3. SCROLLABLE NAVIGATION ITEMS */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {sections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {sec.section}
              </div>
            )}
            {sec.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-xl transition-all duration-150 ${
                    isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 space-x-3 text-xs'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/5 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r-full shadow-sm shadow-cyan-400" />
                    )}

                    <div className={`flex-shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {item.icon}
                    </div>

                    {!isCollapsed && (
                      <span className="truncate flex-1 tracking-normal">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                          item.badge === 'AI'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {!isCollapsed && isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400/80 flex-shrink-0" />
                    )}

                    {/* Tooltip for Collapsed Mode */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-slate-200 text-xs font-medium rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                        {item.label}
                        {item.badge && <span className="ml-1.5 text-[9px] text-cyan-400">({item.badge})</span>}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* 4. SANDBOX ENVIRONMENT CARD */}
      <div className="p-3 flex-shrink-0">
        {!isCollapsed ? (
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-slate-200 font-semibold text-xs">
              <span className="flex items-center">
                <Activity className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                Live Demo Sandbox
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              NMBI, Garda, Maps, OCR & SEPA adapters active.
            </p>
          </div>
        ) : (
          <div className="flex justify-center p-1" title="Live Demo Sandbox Active">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
        )}
      </div>

      {/* 5. USER PROFILE & LOGOUT FOOTER */}
      <div className="border-t border-slate-800/80 p-3 bg-slate-950/40 flex-shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center font-bold text-xs text-white shadow-md flex-shrink-0">
                {(user?.full_name || 'SC').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {user?.full_name || 'Dr. Mark Higgins'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {user?.email || 'facility@stjames.ie'}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center font-bold text-xs text-white"
              title={user?.full_name || 'Dr. Mark Higgins'}
            >
              {(user?.full_name || 'SC').slice(0, 2).toUpperCase()}
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};