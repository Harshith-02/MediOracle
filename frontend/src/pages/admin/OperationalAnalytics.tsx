import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { MetricCard } from '../../components/common/MetricCard';
import { BarChart3, Sparkles, Sliders, ShieldCheck, Users, Activity, TrendingUp } from 'lucide-react';

export const OperationalAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // What-If Simulator state
  const [proposedRate, setProposedRate] = useState(48.0);
  const [baseRate, setBaseRate] = useState(38.0);
  const [simulation, setSimulation] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, fRes, iRes] = await Promise.all([
          api.get('/analytics/operational-analytics'),
          api.get('/analytics/demand-forecast'),
          api.get('/integrations/status')
        ]);
        setAnalytics(aRes.data);
        setForecast(fRes.data);
        setIntegrations(iRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const runSimulation = async () => {
      try {
        const res = await api.get(`/analytics/what-if-simulation?base_rate=${baseRate}&proposed_rate=${proposedRate}&required_count=2&department_budget=5000`);
        setSimulation(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    runSimulation();
  }, [baseRate, proposedRate]);

  if (loading) return <div className="p-6 text-slate-400">Loading Operational Intelligence...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h1 className="text-xl font-bold text-slate-100 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" /> Agency Operations & AI Workforce Intelligence
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time platform metrics, demand forecasting, what-if scenario planning & integration monitoring.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Global Fill Rate"
          value={`${analytics?.global_fill_rate || 92.8}%`}
          subtext="Target: 90%+"
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          trend="+4.1%"
          trendType="positive"
        />
        <MetricCard
          title="Active Professionals"
          value={analytics?.total_active_professionals || 18}
          subtext="Fully compliant workforce"
          icon={<Users className="w-5 h-5 text-cyan-400" />}
        />
        <MetricCard
          title="Gross Agency Margin"
          value={`${analytics?.gross_margin_percentage || 18.5}%`}
          subtext="Net profitability"
          icon={<Activity className="w-5 h-5 text-purple-400" />}
        />
        <MetricCard
          title="AI Override Rate"
          value={`${analytics?.ai_match_override_rate || 4.2}%`}
          subtext="Low human intervention"
          icon={<Sparkles className="w-5 h-5 text-amber-400" />}
        />
      </div>

      {/* Demand AI Forecasting Widget */}
      {forecast && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-cyan-400" /> AI Workforce Demand Forecast (Next 48 Hours)
            </h3>
            <span className="text-xs text-cyan-400 font-mono">Confidence: {forecast.historical_fill_rate}%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forecast.predicted_shortages.map((ps: any, idx: number) => (
              <div key={idx} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">{ps.ward}</span>
                  <span className="text-amber-400 font-bold font-mono">Shortage: {ps.shortage_count} {ps.role_required}</span>
                </div>
                <div className="text-[11px] text-slate-400">Shift Window: {ps.date} ({ps.shift_window})</div>
                <div className="text-xs text-cyan-300 bg-cyan-500/10 p-2 rounded border border-cyan-500/20 font-medium">
                  Recommendation: {ps.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What-If Scenario Analysis Simulator */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center">
              <Sliders className="w-4 h-4 mr-2 text-purple-400" /> What-If Rate & Fill Simulator
            </h3>
            <p className="text-xs text-slate-400">Simulate shift rate adjustments to predict fill probability and budget impact</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Proposed Hourly Rate</span>
                <span className="font-mono text-cyan-400">€{proposedRate}/hr</span>
              </div>
              <input
                type="range"
                min="35"
                max="65"
                step="1"
                value={proposedRate}
                onChange={(e) => setProposedRate(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <div>Base Standard Rate: €{baseRate}/hr</div>
              <div>Rate Delta: <strong className="text-emerald-400">+€{(proposedRate - baseRate).toFixed(2)}/hr</strong></div>
            </div>
          </div>

          {simulation && (
            <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-xs text-slate-400">Projected Fill Probability</div>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                  {simulation.estimated_fill_probability}%
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">High fill likelihood</div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Estimated Total Shift Cost</div>
                <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
                  €{simulation.total_estimated_cost.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Budget Impact: {simulation.budget_impact_pct}%</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Integration Monitoring Dashboard */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center">
          <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" /> External Integration Status Monitoring
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {integrations.map((int) => (
            <div key={int.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{int.name}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {int.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{int.disclaimer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
