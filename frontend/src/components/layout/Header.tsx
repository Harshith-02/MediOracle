import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import {
  Bell,
  ShieldCheck,
  UserCheck,
  Building2,
  ChevronDown,
  Sparkles,
  Search,
  Plus,
  PanelLeft,
  Check,
  Zap,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed, toggleSidebar }) => {
  const { user, activeRole, switchActiveRole, login } = useAuthStore();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const demoAccounts = [
    { role: 'FACILITY', email: 'facility@stjames.ie', label: 'Facility Manager', org: "St. James's Hospital" },
    { role: 'PROFESSIONAL', email: 'nurse.sarah@medioracle.com', label: 'ICU Specialist Nurse', org: 'Sarah Connor, RGN' },
    { role: 'ADMIN', email: 'admin@medioracle.com', label: 'Platform & AI Admin', org: 'Agency Headquarters' },
    { role: 'COMPLIANCE', email: 'compliance@medioracle.com', label: 'Credential Review Officer', org: 'NMBI & Garda Registry' },
    { role: 'PAYROLL', email: 'payroll@medioracle.com', label: 'Payroll & Invoicing', org: 'SEPA Financial Ops' },
    { role: 'SUPPORT', email: 'support@medioracle.com', label: 'Helpdesk Escalations', org: '24/7 Operations Hub' },
  ];

  const handleDemoSwitch = async (email: string, role: string) => {
    await login(email, 'Password123!');
    switchActiveRole(role);
    setShowDemoAccounts(false);
  };

  return (
    <header className="h-16 border-b border-slate-800/90 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 flex-shrink-0 shadow-sm">
      {/* LEFT: SIDEBAR TOGGLE & BREADCRUMB / SITE */}
      <div className="flex items-center space-x-4 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition"
          title={isSidebarCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
        >
          <PanelLeft className="w-4 h-4 text-cyan-400" />
        </button>

        <div className="h-4 w-[1px] bg-slate-800"></div>

        {/* Location & Organization Badge */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-750 text-slate-300 shadow-inner">
            <Building2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="text-slate-400 hidden sm:inline">Site:</span>
            <span className="font-semibold text-slate-100 truncate max-w-[180px] md:max-w-[260px]">
              St. James's Hospital (Dublin 8)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50 flex-shrink-0 ml-1"></span>
          </div>

          <div className="hidden lg:flex items-center space-x-1 text-[11px] text-slate-400 px-2 py-1 bg-slate-800/40 rounded-lg border border-slate-800/60">
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>HSE Dublin South Central</span>
          </div>
        </div>
      </div>

      {/* CENTER: QUICK SEARCH BAR */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shifts, staff credentials, wards, or invoices..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-12 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition shadow-inner"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* RIGHT: ACTIONS, ROLE SWITCHER & NOTIFICATIONS */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        {/* Quick Post Shift CTA if Facility */}
        {activeRole === 'FACILITY' && (
          <Link
            to="/facility/shifts/new"
            className="hidden xl:flex items-center space-x-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md shadow-cyan-500/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Shift</span>
          </Link>
        )}

        {/* 1-Click Demo Account Switcher Button */}
        <button
          onClick={() => setShowDemoAccounts(!showDemoAccounts)}
          className="flex items-center text-xs font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1.5 rounded-xl transition shadow-sm shadow-cyan-500/5"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-cyan-400 animate-spin" />
          <span className="hidden sm:inline">Switch Demo Role</span>
          <span className="sm:hidden">Switch</span>
        </button>

        {/* Active Role Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-200 hover:border-slate-600 transition shadow-sm"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline text-slate-400">Role:</span>
            <strong className="text-white font-semibold">{activeRole}</strong>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Switch Portal Role
              </div>
              {['FACILITY', 'PROFESSIONAL', 'ADMIN', 'COMPLIANCE', 'PAYROLL', 'SUPPORT'].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchActiveRole(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-800 transition flex items-center justify-between ${
                    activeRole === r ? 'text-cyan-400 font-bold bg-cyan-500/10' : 'text-slate-300'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeRole === r ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                    <span>{r} Portal</span>
                  </span>
                  {activeRole === r && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon with Ping Animation */}
        <button
          className="p-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600 relative transition shadow-sm"
          title="Notifications & Ward Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400"></span>
        </button>
      </div>

      {/* Demo Accounts Drawer Modal */}
      {showDemoAccounts && (
        <div className="absolute right-6 top-16 w-84 bg-slate-900/98 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block">Instant Demo Switcher</span>
                <span className="text-[10px] text-slate-400">Pre-configured role profiles</span>
              </div>
            </div>
            <button
              onClick={() => setShowDemoAccounts(false)}
              className="text-slate-400 hover:text-slate-200 text-xs p-1 rounded-md hover:bg-slate-800 transition"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleDemoSwitch(acc.email, acc.role)}
                className={`w-full text-left p-2.5 rounded-xl transition border flex items-center justify-between group ${
                  activeRole === acc.role
                    ? 'bg-cyan-500/10 border-cyan-500/30'
                    : 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
                    <span className="text-cyan-400">{acc.role}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 text-[11px] font-normal truncate">{acc.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate block">{acc.org}</span>
                </div>
                <span className="text-[9px] text-cyan-400/80 font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 group-hover:text-cyan-300">
                  Switch →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};