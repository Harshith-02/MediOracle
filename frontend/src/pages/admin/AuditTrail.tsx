import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AuditEvent } from '../../types';
import { ShieldCheck, Search, Filter } from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditEvents();
  }, []);

  const fetchAuditEvents = async () => {
    try {
      const res = await api.get('/audit/');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-cyan-400" /> Immutable Event Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full compliance & system event history. Every state transition, AI override, and financial modification is permanently recorded.
          </p>
        </div>
      </div>

      {/* Audit Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4 text-right">Reason / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {new Date(ev.created_at).toLocaleString('en-IE')}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-200">{ev.actor_email}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded font-mono font-bold text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {ev.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-semibold">{ev.entity_name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">#{ev.entity_id.substring(0, 8)}</td>
                  <td className="py-3.5 px-4 text-right text-slate-300">
                    {ev.reason ? (
                      <span className="text-purple-300 font-semibold">{ev.reason}</span>
                    ) : (
                      <span className="text-slate-500">Standard system execution</span>
                    )}
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
