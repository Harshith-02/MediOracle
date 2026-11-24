import React, { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtext, icon, trend, trendType = 'positive' }) => {
  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800/80 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        {icon && <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-slate-50 tracking-tight">{value}</div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            trendType === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
    </div>
  );
};
