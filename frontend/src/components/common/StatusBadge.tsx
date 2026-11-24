import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'risk' | 'shift' | 'compliance' | 'timesheet';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'shift' }) => {
  const upper = status.toUpperCase();

  if (type === 'risk') {
    if (upper === 'GREEN') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
          GREEN (LOW RISK)
        </span>
      );
    }
    if (upper === 'YELLOW') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse"></span>
          YELLOW (MODERATE RISK)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5 animate-pulse"></span>
        RED (HIGH RISK)
      </span>
    );
  }

  if (type === 'compliance') {
    if (upper === 'FULLY_COMPLIANT' || upper === 'VERIFIED') {
      return <span className="px-2.5 py-1 rounded font-medium text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">VERIFIED</span>;
    }
    if (upper === 'EXPIRING_SOON') {
      return <span className="px-2.5 py-1 rounded font-medium text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">EXPIRING SOON</span>;
    }
    return <span className="px-2.5 py-1 rounded font-medium text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20">RESTRICTED</span>;
  }

  if (type === 'timesheet') {
    if (upper === 'LOCKED' || upper === 'APPROVED') {
      return <span className="px-2.5 py-1 rounded font-medium text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">LOCKED / APPROVED</span>;
    }
    return <span className="px-2.5 py-1 rounded font-medium text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">SUBMITTED</span>;
  }

  // Shift Status Badges
  switch (upper) {
    case 'CONFIRMED':
      return <span className="px-2.5 py-1 rounded font-semibold text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">CONFIRMED</span>;
    case 'POSTED':
      return <span className="px-2.5 py-1 rounded font-semibold text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">OPEN / POSTED</span>;
    case 'OFFERED':
      return <span className="px-2.5 py-1 rounded font-semibold text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">OFFER SENT</span>;
    case 'COMPLETED':
      return <span className="px-2.5 py-1 rounded font-semibold text-xs bg-slate-700 text-slate-300 border border-slate-600">COMPLETED</span>;
    default:
      return <span className="px-2.5 py-1 rounded font-semibold text-xs bg-slate-800 text-slate-400">{status}</span>;
  }
};
