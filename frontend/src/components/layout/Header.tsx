import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Bell, ShieldCheck, UserCheck, Building2, LogOut, ChevronDown, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, activeRole, switchActiveRole, logout, login } = useAuthStore();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const availableRoles = user?.roles || ['FACILITY', 'PROFESSIONAL', 'ADMIN'];

  const demoAccounts = [
    { role: 'FACILITY', email: 'facility@stjames.ie', label: 'Facility Manager (St. James)' },
    { role: 'PROFESSIONAL', email: 'nurse.sarah@medioracle.com', label: 'Sarah Connor (ICU Nurse)' },
    { role: 'ADMIN', email: 'admin@medioracle.com', label: 'Platform Admin' },
    { role: 'COMPLIANCE', email: 'compliance@medioracle.com', label: 'Compliance Officer' },
    { role: 'PAYROLL', email: 'payroll@medioracle.com', label: 'Payroll Manager' },
    { role: 'SUPPORT', email: 'support@medioracle.com', label: 'Support Agent' },
  ];

  const handleDemoSwitch = async (email: string, role: string) => {
    await login(email, 'Password123!');
    switchActiveRole(role);
    setShowDemoAccounts(false);
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Active Scope */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
            M
          </div>
          <span className="font-bold text-lg text-slate-100 tracking-tight">MediOracle</span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            NEXGILE MVP
          </span>
        </div>

        <div className="h-4 w-[1px] bg-slate-800 hidden md:block"></div>

        <div className="hidden md:flex items-center text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <Building2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
          <span>Active Site: <strong className="text-slate-200">St. James's Hospital (Dublin 8)</strong></span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-3">
        {/* Quick Demo Switcher */}
        <button
          onClick={() => setShowDemoAccounts(!showDemoAccounts)}
          className="flex items-center text-xs font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          Switch Demo Role
        </button>

        {/* Role Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:border-slate-700 transition"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Role: <strong className="text-white">{activeRole}</strong></span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Switch Portal Mode
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
                  <span>{r} Portal</span>
                  {activeRole === r && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <button className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400"></span>
        </button>

        {/* User Avatar & Logout */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-200">{user?.full_name || 'Sarah Connor'}</div>
            <div className="text-[10px] text-slate-500">{user?.email || 'nurse.sarah@medioracle.com'}</div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Demo Accounts Drawer Modal */}
      {showDemoAccounts && (
        <div className="absolute right-6 top-16 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5 text-cyan-400" /> Demo Account Switcher
            </span>
            <button onClick={() => setShowDemoAccounts(false)} className="text-slate-400 hover:text-slate-200 text-xs">✕</button>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Click any role to immediately authenticate as the corresponding demo user:
          </p>
          <div className="space-y-1.5">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleDemoSwitch(acc.email, acc.role)}
                className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition flex flex-col"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span>{acc.role}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">1-click switch</span>
                </div>
                <span className="text-[11px] text-slate-400">{acc.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
