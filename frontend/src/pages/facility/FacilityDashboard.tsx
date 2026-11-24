import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Users, AlertTriangle, Clock, TrendingUp, DollarSign, Calendar, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FacilityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, sRes] = await Promise.all([
          api.get('/analytics/facility-dashboard'),
          api.get('/shifts/')
        ]);
        setMetrics(mRes.data);
        setShifts(sRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-900 rounded w-1/4"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-slate-900 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner & Risk Level */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-100">{metrics?.facility_name}</h1>
            <StatusBadge status={metrics?.risk_status || 'YELLOW'} type="risk" />
          </div>
          <p className="text-xs text-slate-400">Real-Time Ward Workforce Demand & Risk Management System</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/facility/shifts/new"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center transition"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Post New Shift
          </Link>
        </div>
      </div>

      {/* Shortage Alerts Banner */}
      {metrics?.shortage_alerts && metrics.shortage_alerts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-xs font-bold text-amber-300">Staffing Risk Notification</div>
            <ul className="mt-1 text-xs text-amber-200/80 space-y-0.5 list-disc list-inside">
              {metrics.shortage_alerts.map((alert: string, idx: number) => (
                <li key={idx}>{alert}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Open Shifts"
          value={metrics?.open_shifts_count || 0}
          subtext="Requiring immediate fill"
          icon={<Calendar className="w-5 h-5" />}
          trend="Action Needed"
          trendType="negative"
        />
        <MetricCard
          title="Shift Fill Rate"
          value={`${metrics?.fill_rate_percentage || 92.8}%`}
          subtext="Target: 90%+"
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          trend="+3.2%"
          trendType="positive"
        />
        <MetricCard
          title="Avg Time-To-Fill"
          value={`${metrics?.time_to_fill_hours || 4.2} hrs`}
          subtext="AI Match dispatch speed"
          icon={<Clock className="w-5 h-5 text-cyan-400" />}
        />
        <MetricCard
          title="Monthly Spend"
          value={`€${metrics?.spent_to_date?.toLocaleString() || '48,200'}`}
          subtext={`Budget: €${metrics?.total_monthly_budget?.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5 text-purple-400" />}
        />
      </div>

      {/* Ward Staffing Breakdown Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Ward & Department Demand</h3>
            <p className="text-xs text-slate-400">Required vs Confirmed Roster Numbers</p>
          </div>
          <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">
            4 Active Wards
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Ward Name</th>
                <th className="py-3 px-4">Required Staff</th>
                <th className="py-3 px-4">Confirmed</th>
                <th className="py-3 px-4">Shortage</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {metrics?.ward_breakdown?.map((w: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-200">{w.ward_name}</td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">{w.required} Nurses/HCAs</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-mono font-semibold">{w.confirmed} Confirmed</td>
                  <td className="py-3.5 px-4 text-amber-400 font-mono font-semibold">{w.shortage} Shortage</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={w.risk} type="risk" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to="/facility/shifts/new"
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20 inline-flex items-center"
                    >
                      Fill Ward
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Open Shifts Roster */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Active Open Shifts</h3>
            <p className="text-xs text-slate-400">Manage shift matching, candidates, and offers</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Shift Role / Specialty</th>
                <th className="py-3 px-4">Ward Location</th>
                <th className="py-3 px-4">Start Time</th>
                <th className="py-3 px-4">Hourly Rate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">AI Matching</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {shifts.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100">{s.role_required} ({s.specialty_required})</div>
                    <div className="text-[10px] text-slate-400">Acuity: {s.acuity_level}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{s.ward_name}</td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">
                    {new Date(s.start_time).toLocaleString('en-IE', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    €{s.hourly_rate}/h {s.incentive_bonus > 0 && <span className="text-amber-400 text-[10px]">(+€{s.incentive_bonus} bonus)</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={s.status} type="shift" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/facility/shifts/${s.id}`}
                      className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/30 inline-flex items-center transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Match & Rank
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
