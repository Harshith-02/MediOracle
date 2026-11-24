import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Sparkles, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, activeRole } = useAuthStore();
  const [email, setEmail] = useState('facility@stjames.ie');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-redirect if user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (activeRole === 'PROFESSIONAL') navigate('/professional/dashboard');
      else if (activeRole === 'ADMIN') navigate('/admin/analytics');
      else if (activeRole === 'COMPLIANCE') navigate('/compliance/dashboard');
      else if (activeRole === 'PAYROLL') navigate('/payroll/timesheets');
      else if (activeRole === 'SUPPORT') navigate('/support/cases');
      else navigate('/facility/dashboard');
    }
  }, [isAuthenticated, activeRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      // Navigation will trigger via useEffect or explicit call
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setLoading(true);
    setError('');
    try {
      await login(demoEmail, 'Password123!');
    } catch (err: any) {
      console.error('Demo login error:', err);
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-cyan-500/25">
          M
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-100">MediOracle Portal</h2>
        <p className="mt-2 text-xs text-slate-400">AI-Powered Healthcare Workforce Management Platform</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-lg shadow-cyan-500/20 flex items-center justify-center"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          {/* Quick Demo Switcher Grid */}
          <div className="mt-6 border-t border-slate-800/80 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-400" /> One-Click Demo Logins
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('facility@stjames.ie', 'FACILITY')}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition"
              >
                <div className="text-xs font-bold text-cyan-400">Facility Manager</div>
                <div className="text-[10px] text-slate-400">St. James Hospital</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('nurse.sarah@medioracle.com', 'PROFESSIONAL')}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition"
              >
                <div className="text-xs font-bold text-emerald-400">Sarah Connor</div>
                <div className="text-[10px] text-slate-400">ICU Nurse (RGN)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@medioracle.com', 'ADMIN')}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition"
              >
                <div className="text-xs font-bold text-purple-400">Platform Admin</div>
                <div className="text-[10px] text-slate-400">Operations & AI</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('payroll@medioracle.com', 'PAYROLL')}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition"
              >
                <div className="text-xs font-bold text-amber-400">Payroll Manager</div>
                <div className="text-[10px] text-slate-400">Invoices & SEPA</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
